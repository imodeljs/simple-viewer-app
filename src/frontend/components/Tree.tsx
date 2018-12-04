/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { IModelApp, IModelConnection } from "@bentley/imodeljs-frontend";
import { Tree } from "@bentley/ui-components";
import { PresentationTreeDataProvider, withUnifiedSelection } from "@bentley/presentation-components/lib/tree";

// create a HOC tree component that supports unified selection
// tslint:disable-next-line:variable-name
const SimpleTree = withUnifiedSelection(Tree);

/** React properties for the tree component */
export interface Props {
  /** iModel whose contents should be displayed in the tree */
  imodel: IModelConnection;
  /** ID of the presentation rule set to use for creating the hierarchy in the tree */
  rulesetId: string;
}

/** Tree component for the viewer app */
export default class SimpleTreeComponent extends React.Component<Props> {
  public render() {
    return (
      <>
        <h3>{IModelApp.i18n.translate("SimpleViewer:components.tree")}</h3>
        <div style={{flex: "1"}}>
          <SimpleTree dataProvider={new PresentationTreeDataProvider(this.props.imodel, this.props.rulesetId)} />
        </div>
      </>
    );
  }
}
