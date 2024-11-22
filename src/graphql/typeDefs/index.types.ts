import { ArgsType, Field } from "type-graphql";
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
