import { RpcManager, IModelToken } from "@bentley/imodeljs-common";
import { FileReaderRpcInterface } from "../common/FileReaderRpcInterface";
import { IModelDb } from "@bentley/imodeljs-backend";
import * as fs from "fs";
import * as parse from "csv-parse/lib/sync";

export class FileReaderRpcImpl extends FileReaderRpcInterface {
  public static register() { RpcManager.registerImpl(FileReaderRpcInterface, FileReaderRpcImpl); }
  private _filePath = "assets/testdata.csv";

  public async fetchInfo(_token: IModelToken): Promise<any[]> {
    const data: string = fs.readFileSync(this._filePath, "utf8");
    let info = parse(data, {delimiter: ",", columns: ["status", "component_id"]});
    info = await this.fetchPositions(info, _token);
    return info;
  }

  private async fetchPositions(info: any[], token: IModelToken) {
    let componentList = "(";
    const count = info.length;
    // prepare list of component ids
    info.forEach((value: any, index: number) => {
      componentList += "'" + value.component_id + "'";
      componentList += (++index !== count) ? ", " : ")";
    });

    const query = `SELECT piping.Component_id, physical.Origin
      FROM AutoPlantPDWPersistenceStrategySchema.PipingComponent piping
      JOIN Bis.ElementOwnsChildElements link ON piping.ECInstanceId = link.SourceECInstanceId
      JOIN Bis.PhysicalElement physical ON link.TargetECInstanceId = physical.ECInstanceId
      WHERE piping.Component_id IN ${componentList}`;

    const imodel = IModelDb.find(token);
    const rows = [];
    for await (const row of imodel.query(query)) rows.push(row);

    rows.forEach((row) => {
      const index = info.findIndex((x) => x.component_id === row.cOMPONENT_ID);
      if (index > 0) info[index].position = row.origin;
    });

    return info;
  }
}
