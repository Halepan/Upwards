import { IRepository } from "./irepository";



export abstract class  ISyncableRepossitory extends IRepository{

    findPendingSync():undefined[]{
        return[];
    }

    markAsSynced():void{}

    findByUuid():undefined{}
}