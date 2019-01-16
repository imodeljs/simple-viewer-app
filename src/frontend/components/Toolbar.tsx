/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/

import * as React from "react";
import {
  IModelApp,
  ZoomViewTool, PanViewTool, RotateViewTool, SelectionTool,
} from "@bentley/imodeljs-frontend";

import "./Components.scss";

/** Toolbar containing simple navigation tools */
const toolbar = () => {
  return (
    <div className="toolbar">
      <a href="#" title={IModelApp.i18n.translate("SimpleViewer:tools.select")} onClick={select}><span className="icon icon-cursor"></span></a>
      <a href="#" title={IModelApp.i18n.translate("SimpleViewer:tools.rotate")} onClick={rotate}><span className="icon icon-gyroscope"></span></a>
      <a href="#" title={IModelApp.i18n.translate("SimpleViewer:tools.pan")} onClick={pan}><span className="icon icon-hand-2"></span></a>
      <a href="#" title={IModelApp.i18n.translate("SimpleViewer:tools.zoom")} onClick={zoom}><span className="icon icon-zoom"></span></a>
    </div>
  );
};

/**
 * See the https://imodeljs.github.io/iModelJs-docs-output/learning/frontend/tools/
 * for more details and available tools.
 */

const select = () => {
  IModelApp.tools.run(SelectionTool.toolId);
};

const rotate = () => {
  IModelApp.tools.run(RotateViewTool.toolId, IModelApp.viewManager.selectedView);
};

const pan = () => {
  IModelApp.tools.run(PanViewTool.toolId, IModelApp.viewManager.selectedView);
};

const zoom = () => {
  IModelApp.tools.run(ZoomViewTool.toolId, IModelApp.viewManager.selectedView);
};

export default toolbar;
