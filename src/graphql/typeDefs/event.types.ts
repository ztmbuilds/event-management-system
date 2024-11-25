import {
  ArgsType,
  Field,
  InputType,
  Int,
  registerEnumType,
  ObjectType,
  GraphQLISODateTime,
} from "type-graphql";
import {
  Min,
  IsArray,
  IsNotEmpty,
  MaxLength,
  Validate,
  IsUUID,
  IsDate,
} from "class-validator";
import {
  EndDateValidator,
  StartDateValidator,
} from "../../utils/customValidator";
import { FilterArgs } from "./index.types";
import { Event } from "../../entities/event.entity";

@InputType()
export class CreateEventInput {
  @IsNotEmpty()
  @MaxLength(255)
  @Field()
  title: string;

  @IsNotEmpty()
  @Field()
  description: string;

  @Validate(StartDateValidator)
  @Field()
  startDate: Date;

  @Validate(EndDateValidator)
  @Field()
  endDate: Date;

  @Min(1)
  @Field(() => Int)
  capacity: number;

  @IsArray()
  @Field(() => [String])
  tags: string[];
}

@InputType()
export class UpdateEventInput {
  @MaxLength(255)
  @Field({ nullable: true })
  title?: string;

  @MaxLength(1000)
  @Field({ nullable: true })
  description?: string;

  @Min(1)
  @Field(() => Int, { nullable: true })
  capacity?: number;

  @IsArray()
  @Field(() => [String], { nullable: true })
  tags: string[];

  @IsUUID()
  @Field({ nullable: true })
  venueId: string;
}

@InputType()
export class UpdateEventDatesInput {
  @Validate(StartDateValidator)
  @Field({ nullable: true })
  startDate: Date;

  @Validate(EndDateValidator)
  @Field({ nullable: true })
  endDate: Date;
}

@InputType()
class PeriodArgs {
  @IsDate()
  @Field(() => GraphQLISODateTime)
  startDate?: Date;

  @IsDate()
  @Field(() => GraphQLISODateTime)
  endDate?: Date;
}

export enum EventOrderBy {
  TITLE = "title",
  START_DATE = "startDate",
  END_DATE = "endDate",
  STATUS = "status",
  CAPACITY = "capacity",
  CREATED_AT = "createdAt",
}

registerEnumType(EventOrderBy, {
  name: "EventOrderBy",
});

@ArgsType()
export class EventFilterArgs extends FilterArgs<EventOrderBy> {
  @Field(() => [String], { nullable: true, defaultValue: [] })
  tags?: string[];

  @Field(() => PeriodArgs, { nullable: true })
  period?: PeriodArgs;

  @Field(() => EventOrderBy, { nullable: true })
  orderBy?: EventOrderBy;
}

@ObjectType()
class Pagination {
  @Field()
  total: number;
  @Field()
  size: number;
  @Field()
  page: number;
}

@ObjectType()
export class PaginatedEventResult {
  @Field(() => [Event])
  events: string[];

  @Field(() => Pagination)
  pagination: Pagination;
}
