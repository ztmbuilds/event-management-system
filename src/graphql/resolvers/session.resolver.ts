import {
  Arg,
  Args,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import sessionService, { SessionService } from "../../services/session.service";
import {
  CreateSessionInput,
  PaginatedSessionResult,
  SessionFilterArgs,
  UpdateSessionInput,
} from "../typeDefs/session.types";
import { MyContext } from "../../utils/context";
import { Session } from "../../entities/session.entity";
import { Speaker } from "../../entities/speaker.entity";
import { Attendee } from "../../entities/attendee.entity";

@Resolver(() => Session)
export class SessionResolver {
  sessionService: SessionService;
  constructor() {
    this.sessionService = sessionService;
  }

  @Query(() => PaginatedSessionResult)
  async sessions(
    @Args(() => SessionFilterArgs) filter: SessionFilterArgs,
    @Arg("eventId") eventId: string
  ) {
    return await this.sessionService.getAllSessionsForEvent(filter, eventId);
  }

  @Query(() => Session)
  async session(@Arg("sessionId") sessionId: string) {
    return await this.sessionService.getSession(sessionId);
  }

  @Authorized(["ORGANIZER"])
  @Mutation(() => Session)
  async createSession(
    @Arg("data") data: CreateSessionInput,
    @Ctx() ctx: MyContext
  ) {
    return await this.sessionService.createSession(data, ctx);
  }

  @Mutation(() => Session)
  async updateSession(
    @Arg("data") data: UpdateSessionInput,
    @Arg("sessionId") sessionId: string,
    @Arg("eventId") eventId: string,
    @Ctx() ctx: MyContext
  ) {
    return await this.sessionService.updateSession(
      sessionId,
      eventId,
      data,
      ctx
    );
  }

  @FieldResolver(() => Event)
  async event(@Root() session: Session, @Ctx() ctx: MyContext) {
    return await ctx.loaders.eventLoader.load(session.eventId);
  }

  @FieldResolver(() => [Speaker])
  async speakers(@Root() session: Session, @Ctx() ctx: MyContext) {
    return await ctx.loaders.speakerLoader.load(session.id);
  }

  @FieldResolver(() => [Attendee])
  async attendees(@Root() session: Session, @Ctx() ctx: MyContext) {
    return await ctx.loaders.sessionAttendeesLoader.load(session.id);
  }
}
