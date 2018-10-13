/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { IModelApp, IModelConnection } from "@bentley/imodeljs-frontend";
import { Orientation } from "@bentley/ui-core";
import { PropertyGrid } from "@bentley/ui-components";
import { PresentationPropertyDataProvider, withUnifiedSelection } from "@bentley/presentation-components/lib/propertygrid";

// create a HOC property grid component that supports unified selection
// tslint:disable-next-line:variable-name
const SimplePropertyGrid = withUnifiedSelection(PropertyGrid);

/** React properties for the property grid component */
export interface Props {
  /** iModel whose contents should be displayed in the property grid */
  imodel: IModelConnection;
  /** ID of the presentation rule set to use for creating the content displayed in the property grid */
  rulesetId: string;
}

/** Property grid component for the viewer app */
export default class SimplePropertiesComponent extends React.Component<Props> {
  public render() {
    return (
      <div>
        <h3>{IModelApp.i18n.translate("SimpleViewer:components.properties")}</h3>
        <SimplePropertyGrid
          orientation={Orientation.Horizontal}
          dataProvider={new PresentationPropertyDataProvider(this.props.imodel, this.props.rulesetId)}
        />
      </div>
    );
  }
}
