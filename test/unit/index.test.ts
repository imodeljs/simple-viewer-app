/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/

import * as typemoq from "typemoq";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { UiCore } from "@bentley/ui-core";
import { UiComponents } from "@bentley/ui-components";
import { cleanup } from "react-testing-library";
import { Presentation, SelectionManager } from "@bentley/presentation-frontend";
import { SelectionScopesManager } from "@bentley/presentation-frontend/lib/selection/SelectionScopesManager";

function mockI18n() {
  IModelApp.i18n = {
    translateKeys: () => "",
    translate: (text: string) => text,
    loadNamespace: () => {},
    languageList: () => ["en"],
    registerNamespace: () => ({ readFinished: Promise.resolve(), name: "" }),
    waitForAllRead: async () => [],
    unregisterNamespace: () => {},
  } as any;
}

before(async () => {
  mockI18n();

  await UiCore.initialize(IModelApp.i18n);
  await UiComponents.initialize(IModelApp.i18n);

  // Presentation.selection needs to be set, because WithUnifiedSelection requires a SelectionHandler.
  // If selection handler is not provided through props, the HOC creates a new SelectionHandler by
  // using Presentation.selection
  Presentation.selection = new SelectionManager({ scopes: typemoq.Mock.ofType<SelectionScopesManager>().object });
});

after(() => {
  UiCore.terminate();
  UiComponents.terminate();
});

afterEach(() => {
  cleanup();
});
