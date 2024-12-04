import { IsISO8601, IsOptional, IsUUID, MaxLength } from "class-validator";
import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from "type-graphql";
import { Session, SessionStatus } from "../../entities/session.entity";
import { FilterArgs } from "./index.types";
import { Pagination } from "./index.types";

enum SessionOrderBy {
  DATE = "date",
  START_TIME = "startTime",
  END_TIME = "endTime",
}

registerEnumType(SessionOrderBy, {
  name: "SessionOrderBy",
});

@InputType()
export class CreateSessionInput {
  @MaxLength(255)
  @Field()
  title: string;

  @MaxLength(1000)
  @Field()
  description: string;

  @IsISO8601()
  @Field()
  date: string;

  @IsISO8601()
  @Field()
  startTime: string;

  @IsISO8601()
  @Field()
  endTime: string;

  @Field()
  @IsUUID()
  eventId: string;
}

@InputType()
export class UpdateSessionInput {
  @IsOptional()
  @MaxLength(255)
  @Field({ nullable: true })
  title?: string;

  @IsOptional()
  @MaxLength(1000)
  @Field({ nullable: true })
  description?: string;

  @IsOptional()
  @Field({ nullable: true })
  status?: SessionStatus;
}

@InputType()
export class UpdateSessionTime {
  @IsISO8601()
  @Field()
  date: string;

  @IsISO8601()
  @Field()
  startTime: string;

  @IsISO8601()
  @Field()
  endTime: string;
}

@ArgsType()
export class SessionFilterArgs extends FilterArgs<SessionOrderBy> {
  @Field(() => SessionStatus, { nullable: true })
  status?: SessionStatus;

  @Field(() => SessionOrderBy, { nullable: true })
  orderBy?: SessionOrderBy;
}

@ObjectType()
export class PaginatedSessionResult {
  @Field(() => [Session])
  sessions: string[];

  @Field(() => Pagination)
  pagination: Pagination;
}
