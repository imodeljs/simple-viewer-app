/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import {
  BentleyCloudRpcManager, BentleyCloudRpcParams,
  ElectronRpcManager, ElectronRpcConfiguration,
  RpcConfiguration, RpcOperation, IModelTileRpcInterface, RpcResponseCacheControl, MobileRpcConfiguration, MobileRpcManager,
} from "@bentley/imodeljs-common";
import getSupportedRpcs from "../../common/rpcs";

/**
 * Initializes RPC communication based on the platform
 */
export default function initRpc(rpcParams?: BentleyCloudRpcParams): RpcConfiguration {
  let config: RpcConfiguration;
  const rpcInterfaces = getSupportedRpcs();
  if (ElectronRpcConfiguration.isElectron) {
    // initializes RPC for Electron
    config = ElectronRpcManager.initializeClient({}, rpcInterfaces);
  } else if (MobileRpcConfiguration.isMobileFrontend) {
    config = MobileRpcManager.initializeClient(rpcInterfaces);
  } else {
    // initialize RPC for web apps
    if (!rpcParams)
      rpcParams = { info: { title: "simple-viewer-app", version: "v1.0" }, uriPrefix: "http://localhost:3001" };
    config = BentleyCloudRpcManager.initializeClient(rpcParams, rpcInterfaces);

    // temporary until deployed backend is updated
    RpcOperation.lookup(IModelTileRpcInterface, "getTileContent").policy.allowResponseCaching = () => RpcResponseCacheControl.None;
  }
  return config;
}
