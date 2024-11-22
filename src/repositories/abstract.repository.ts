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
import { PaginatedArgs } from "../types";

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

  async findPaginated<E>(
    where: FindOptionsWhere<T>,
    { page, size, order, orderBy }: PaginatedArgs<E>
  ) {
    size = size ? size : 10;
    page = page ? page : 1;

    const skip = (page - 1) * size;
    const take = size || 10;

    const orderOption = {
      [orderBy ? String(orderBy) : "createdAt"]: order ? order : "DESC",
    } as FindOptionsOrder<T>;

    const [data, total] = await AppDataSource.getRepository(
      this.entityTarget
    ).findAndCount({
      take,
      skip,
      order: orderOption,
      where,
    });

    return {
      data,
      pagination: {
        total,
        size,
        page,
      },
    };
  }
}
