/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2017 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
import { RpcInterface, RpcManager, IModelToken } from "@bentley/imodeljs-common";

export abstract class FileReaderRpcInterface extends RpcInterface {

  public static interfaceVersion = "1.0.0";
  public static interfaceName = "FileReaderRpcInterface";
  public static types = () => [IModelToken];

  public static getClient(): FileReaderRpcInterface { return RpcManager.getClientForInterface(this); }
  public async fetchInfo (_token: IModelToken): Promise<any[]> { return this.forward.apply(this, arguments as any) as any; }
}
