

export abstract class IRepository{

  findByID(id:number): undefined | void{

    return ;
  }

  findAll(): undefined[]{
    return[];
  }

  save(entity: undefined):undefined{
    return entity;
  }

  delete(id:number): void{
    
  }
}