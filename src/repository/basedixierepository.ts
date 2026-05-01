import { ISyncableRepossitory } from "./isincablerepository";
import { BaseEntity } from "../domain";
import { Dexie } from "dexie";

export class BaseDixieRepository extends BaseEntity, ISyncableRepossitory{ 
protected _table: Dexie.Table & (number  | undefined)

  constructor(
    id:number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    table: Dexie.Table & (number | undefined)){
    super(id,uuid,createdAt,updatedAt)
    this._table = table 
    }

    
}

