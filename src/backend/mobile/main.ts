/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { RpcInterfaceDefinition, MobileRpcManager } from "@bentley/imodeljs-common";

/**
 * Initializes Web Server backend
 */
export default function initialize(rpcs: RpcInterfaceDefinition[]) {
  MobileRpcManager.initializeImpl(rpcs);
}
