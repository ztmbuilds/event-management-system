import { ArgsType, Field, ObjectType } from "type-graphql";
import { PaginatedArgs } from "../../types";

@ArgsType()
export class FilterArgs<E> implements PaginatedArgs<E> {
  @Field({ nullable: true })
  order?: "ASC" | "DESC";

  @Field({ nullable: true })
  page?: number;

  @Field({ nullable: true })
  size?: number;
}

@ObjectType()
export class Pagination {
  @Field()
  total: number;
  @Field()
  size: number;
  @Field()
  page: number;
}
