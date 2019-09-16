/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import * as path from "path";
import { app as electron } from "electron";
import { Logger } from "@bentley/bentleyjs-core";
import { IModelHost } from "@bentley/imodeljs-backend";
import { Presentation } from "@bentley/presentation-backend";
import getSupportedRpcs from "../common/rpcs";
import { RpcInterfaceDefinition } from "@bentley/imodeljs-common";
import setupEnv from "../common/configuration";
import { FileReaderRpcImpl } from "./FileReaderRpcImpl";

// setup environment
setupEnv();

// initialize logging
Logger.initializeToConsole();

// initialize imodeljs-backend
IModelHost.startup();
FileReaderRpcImpl.register();

// initialize presentation-backend
Presentation.initialize({
  // Specify location of where application's presentation rule sets are located.
  // May be omitted if application doesn't have any presentation rules.
  rulesetDirectories: [path.join("assets", "presentation_rules")],
});

// invoke platform-specific initialization
// tslint:disable-next-line:no-floating-promises
(async () => {
  // get platform-specific initialization function
  let init: (rpcs: RpcInterfaceDefinition[]) => void;
  if (electron) {
    init = (await import("./electron/main")).default;
  } else {
    init = (await import("./web/BackendServer")).default;
  }
  // get RPCs supported by this backend
  const rpcs = getSupportedRpcs();
  // do initialize
  init(rpcs);
})();
