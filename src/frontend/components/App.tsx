/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { Id64String, OpenMode, ActivityLoggingContext, Guid } from "@bentley/bentleyjs-core";
import { AccessToken, ConnectClient, IModelQuery, Project, Config } from "@bentley/imodeljs-clients";
import { IModelApp, IModelConnection } from "@bentley/imodeljs-frontend";
import {
  Presentation,
  SelectionChangeEventArgs, ISelectionProvider,
} from "@bentley/presentation-frontend";
import { SignIn } from "@bentley/ui-framework/lib/oidc/SignIn";
import { SimpleViewerApp } from "../api/SimpleViewerApp";
import PropertiesWidget from "./Properties";
import GridWidget from "./Table";
import TreeWidget from "./Tree";
import ViewportContentControl from "./Viewport";
import { PrimaryLargeButton, Loader } from "@bentley/bwc/lib";
import "@bentley/bwc/lib/classes.scss";
import "./App.css";

// tslint:disable: no-console

/** React state of the App component */
export interface AppState {
  user: {
    accessToken?: AccessToken;
    isLoading?: boolean;
  };
  imodel?: IModelConnection;
  viewDefinitionId?: Id64String;
}

/** A component the renders the whole application UI */
export default class App extends React.Component<{}, AppState> {

  /** Creates an App instance */
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      user: {
        isLoading: SimpleViewerApp.oidc.isLoading,
        accessToken: SimpleViewerApp.oidc.accessToken,
      },
    };
  }

  public componentDidMount() {
    // subscribe for unified selection changes
    Presentation.selection.selectionChange.addListener(this._onSelectionChanged);
    // subscribe for user state changes
    SimpleViewerApp.oidc.onUserStateChanged.addListener(this._onUserStateChanged);
  }

  public componentWillUnmount() {
    // unsubscribe from unified selection changes
    Presentation.selection.selectionChange.removeListener(this._onSelectionChanged);
    // unsubscribe from user state changes
    SimpleViewerApp.oidc.onUserStateChanged.removeListener(this._onUserStateChanged);
  }

  private _onSelectionChanged = (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
    const selection = selectionProvider.getSelection(evt.imodel, evt.level);
    if (selection.isEmpty) {
      console.log("========== Selection cleared ==========");
    } else {
      console.log("========== Selection change ===========");
      if (selection.instanceKeys.size !== 0) {
        // log all selected ECInstance ids grouped by ECClass name
        console.log("ECInstances:");
        selection.instanceKeys.forEach((ids, ecclass) => {
          console.log(`${ecclass}: [${[...ids].join(",")}]`);
        });
      }
      if (selection.nodeKeys.size !== 0) {
        // log all selected node keys
        console.log("Nodes:");
        selection.nodeKeys.forEach((key) => console.log(JSON.stringify(key)));
      }
      console.log("=======================================");
    }
  }

  private _onUserStateChanged = (accessToken: AccessToken | undefined) => {
    this.setState((prev) => ({ user: { ...prev.user, accessToken } }));
  }

  /** Pick the first available spatial view definition in the imodel */
  private async getFirstViewDefinitionId(imodel: IModelConnection): Promise<Id64String> {
    const viewSpecs = await imodel.views.queryProps({});
    const acceptedViewClasses = [
      "BisCore:SpatialViewDefinition",
      "BisCore:DrawingViewDefinition",
    ];
    const acceptedViewSpecs = viewSpecs.filter((spec) => (-1 !== acceptedViewClasses.indexOf(spec.classFullName)));
    if (0 === acceptedViewSpecs.length)
      throw new Error("No valid view definitions in imodel");
    return acceptedViewSpecs[0].id!;
  }

  /** Handle iModel open event */
  private _onIModelSelected = async (imodel: IModelConnection | undefined) => {
    if (!imodel) {
      // reset the state when imodel is closed
      this.setState({ imodel: undefined, viewDefinitionId: undefined });
      return;
    }
    try {
      // attempt to get a view definition
      const viewDefinitionId = imodel ? await this.getFirstViewDefinitionId(imodel) : undefined;
      this.setState({ imodel, viewDefinitionId });
    } catch (e) {
      // if failed, close the imodel and reset the state
      imodel.close(this.state.user.accessToken!);
      this.setState({ imodel: undefined, viewDefinitionId: undefined });
      alert(e.message);
    }
  }

  /** The component's render method */
  public render() {
    let ui: React.ReactNode;

    if (this.state.user.isLoading) {
      // if user is currently being loaded, just tell that
      ui = `${IModelApp.i18n.translate("SimpleViewer:signing-in")}...`;
    } else if (!this.state.user.accessToken) {
      // if user doesn't have and access token, show sign in page
      ui = (<SignIn onSignIn={() => SimpleViewerApp.oidc.signIn()} />);
    } else if (!this.state.imodel || !this.state.viewDefinitionId) {
      // if we don't have an imodel / view definition id - render a button that initiates imodel open
      ui = (<OpenIModelButton accessToken={this.state.user.accessToken} onIModelSelected={this._onIModelSelected} />);
    } else {
      // if we do have an imodel and view definition id - render imodel components
      ui = (<IModelComponents imodel={this.state.imodel} viewDefinitionId={this.state.viewDefinitionId} />);
    }

    // render the app
    return (
      <div className="App">
        <div className="Header">
          <h2>{IModelApp.i18n.translate("SimpleViewer:welcome-message")}</h2>
        </div>
        {ui}
      </div>
    );
  }
}

/** React props for [[OpenIModelButton]] component */
interface OpenIModelButtonProps {
  accessToken: AccessToken;
  onIModelSelected: (imodel: IModelConnection | undefined) => void;
}
/** React state for [[OpenIModelButton]] component */
interface OpenIModelButtonState {
  isLoading: boolean;
}
/** Renders a button that opens an iModel identified in configuration */
class OpenIModelButton extends React.PureComponent<OpenIModelButtonProps, OpenIModelButtonState> {
  public state = { isLoading: false };

  /** Finds project and imodel ids using their names */
  private async getIModelInfo(): Promise<{ projectId: string, imodelId: string }> {
    const projectName = Config.App.get("imjs_test_project");
    const imodelName = Config.App.get("imjs_test_imodel");

    const connectClient = new ConnectClient();
    let project: Project;
    try {
      project = await connectClient.getProject(new ActivityLoggingContext(Guid.createValue()),
        this.props.accessToken, { $filter: `Name+eq+'${projectName}'` });
    } catch (e) {
      throw new Error(`Project with name "${projectName}" does not exist`);
    }

    const imodelQuery = new IModelQuery();
    imodelQuery.byName(imodelName);
    const imodels = await IModelApp.iModelClient.IModels().get(new ActivityLoggingContext(Guid.createValue()),
      this.props.accessToken, project.wsgId, imodelQuery);
    if (imodels.length === 0)
      throw new Error(`iModel with name "${imodelName}" does not exist in project "${projectName}"`);
    return { projectId: project.wsgId, imodelId: imodels[0].wsgId };
  }

  /** Handle iModel open event */
  private async onIModelSelected(imodel: IModelConnection | undefined) {
    this.props.onIModelSelected(imodel);
    this.setState({ isLoading: false });
  }

  private _onClick = async () => {
    this.setState({ isLoading: true });
    let imodel: IModelConnection | undefined;
    try {
      // attempt to open the imodel
      const info = await this.getIModelInfo();
      imodel = await IModelConnection.open(this.props.accessToken, info.projectId, info.imodelId, OpenMode.Readonly);
    } catch (e) {
      alert(e.message);
    }
    this.onIModelSelected(imodel);
  }

  public render() {
    return (
      <PrimaryLargeButton className="button-open-imodel" onClick={this._onClick}>
        <span>{IModelApp.i18n.translate("SimpleViewer:components.imodel-picker.open-imodel")}</span>
        {this.state.isLoading ? <Loader className="bwc-loaders-small white" style={{ marginLeft: "8px" }} /> : undefined}
      </PrimaryLargeButton>
    );
  }
}

/** React props for [[IModelComponents]] component */
interface IModelComponentsProps {
  imodel: IModelConnection;
  viewDefinitionId: Id64String;
}
/** Renders a viewport, a tree, a property grid and a table */
class IModelComponents extends React.PureComponent<IModelComponentsProps> {
  public render() {
    // ID of the presentation ruleset used by all of the controls; the ruleset
    // can be found at `assets/presentation_rules/Default.PresentationRuleSet.xml`
    const rulesetId = "Default";
    return (
      <div className="Content">
        <div className="top-left">
          <ViewportContentControl imodel={this.props.imodel} rulesetId={rulesetId} viewDefinitionId={this.props.viewDefinitionId} />
        </div>
        <div className="right">
          <div className="top">
            <TreeWidget imodel={this.props.imodel} rulesetId={rulesetId} />
          </div>
          <div className="bottom">
            <PropertiesWidget imodel={this.props.imodel} rulesetId={rulesetId} />
          </div>
        </div>
        <div className="bottom">
          <GridWidget imodel={this.props.imodel} rulesetId={rulesetId} />
        </div>
      </div>
    );
  }
}
