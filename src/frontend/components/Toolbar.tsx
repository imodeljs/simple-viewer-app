/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/

import * as React from "react";
import {
  IModelApp,
  ZoomViewTool, PanViewTool, RotateViewTool,
} from "@bentley/imodeljs-frontend";

import "./Components.scss";

/** Toolbar containing simple navigation tools */
const toolbar = () => {
  return (
    <div className="toolbar">
      <a href="#" onClick={zoom}><span className="icon icon-zoom"></span></a>
      <a href="#" onClick={pan}><span className="icon icon-hand-2"></span></a>
      <a href="#" onClick={rotate}><span className="icon icon-gyroscope"></span></a>
    </div>
  );
};

/**
 * See the https://imodeljs.github.io/iModelJs-docs-output/learning/frontend/tools/
 * for more details and available tools.
 */

const zoom = () => {
  IModelApp.tools.run(ZoomViewTool.toolId, IModelApp.viewManager.selectedView);
};

const pan = () => {
  IModelApp.tools.run(PanViewTool.toolId, IModelApp.viewManager.selectedView);
};

const rotate = () => {
  IModelApp.tools.run(RotateViewTool.toolId, IModelApp.viewManager.selectedView);
};

export default toolbar;
