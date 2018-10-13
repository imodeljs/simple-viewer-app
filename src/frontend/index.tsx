/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import * as ReactDOM from "react-dom";
import { SimpleViewerApp } from "./api/SimpleViewerApp";
import { Viewport, ScreenViewport } from "@bentley/imodeljs-frontend";
import { ColorDef, RenderMode } from "@bentley/imodeljs-common";
import App from "./components/App";
import "./index.css";
import setupEnv from "../common/configuration";

// setup environment
setupEnv();

// initialize the application
SimpleViewerApp.startup();

const changeBackgroundColor = (vp: Viewport) => {
  if (!vp.view.is3d())
    return;

  vp.view.viewFlags.renderMode = RenderMode.SmoothShade;
  vp.view.viewFlags.constructions = false;

  const newColor = ColorDef.from(166, 221, 255);
  vp.view.displayStyle.backgroundColor.setFrom(newColor);
  (vp as ScreenViewport).resetUndo();
};

SimpleViewerApp.viewManager.onViewOpen.addListener(changeBackgroundColor);

SimpleViewerApp.ready.then(() => {
  // when initialization is complete, render
  ReactDOM.render(
    <App />,
    document.getElementById("root") as HTMLElement,
  );
});
