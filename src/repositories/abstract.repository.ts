import {
  EntityTarget,
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
} from "typeorm";
import { AppDataSource } from "../database";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

interface FindOneParams<T> {
  where: FindOptionsWhere<T>;
  select?: FindOptionsSelect<T>;
  relations?: FindOptionsRelations<T>;
  otherOptions?: Omit<FindOneOptions<T>, "where" | "select" | "relations">;
}

interface FindParams<T> extends Omit<FindOneParams<T>, "where"> {
  where?: FindOptionsWhere<T>;
}

export class AbstractRepository<T> {
  constructor(private entityTarget: EntityTarget<T>) {}

  async save(entity: T) {
    return await AppDataSource.getRepository(this.entityTarget).save(entity);
  }

  async find(params: FindParams<T> = {}) {
    const { where, select, relations, otherOptions = {} } = params;
    return await AppDataSource.getRepository(this.entityTarget).find({
      where,
      select,
      relations,
      ...otherOptions,
    });
  }

  async findOne(params: FindOneParams<T>) {
    const { where, select, relations, otherOptions = {} } = params;

    const entity = await AppDataSource.getRepository(this.entityTarget).findOne(
      {
        where,
        select,
        relations,
        ...otherOptions,
      }
    );

    return entity;
  }

  async findOneAndUpdate(
    where: FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>
  ) {
    const updateResult = await AppDataSource.getRepository(
      this.entityTarget
    ).update(where, partialEntity);

    if (!updateResult.affected) return null;

    return this.findOne({ where });
  }
}
