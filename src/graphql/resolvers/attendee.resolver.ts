import {
  Arg,
  Query,
  Mutation,
  Ctx,
  Resolver,
  Authorized,
  FieldResolver,
  Root,
} from "type-graphql";
import { MyContext } from "../../utils/context";
import attendeeService, {
  AttendeeService,
} from "../../services/attendee.service";
import { Attendee } from "../../entities/attendee.entity";
import { Roles, User } from "../../entities/user.entity";
import { TicketType } from "../../entities/ticket-type.entity";
import { Session } from "../../entities/session.entity";

@Resolver(() => Attendee)
export class AttendeeResolver {
  private readonly attendeeService: AttendeeService;

  constructor() {
    this.attendeeService = attendeeService;
  }
  @Query(() => Attendee, { nullable: true })
  async attendee(@Arg("id") id: string) {
    return await this.attendeeService.getAttendee(id);
  }

  @Authorized([Roles.ATTENDEE])
  @Mutation(() => Attendee, { nullable: true })
  async registerAttendeeProfileForEvent(
    @Arg("code") code: string,
    @Arg("eventId") eventId: string,
    @Ctx() ctx: MyContext
  ) {
    return await this.attendeeService.registerAttendeeProfileForEvent(
      code,
      eventId,
      ctx
    );
  }

  @Authorized([Roles.ORGANIZER])
  @Mutation(() => Attendee, { nullable: true })
  async checkInAttendee(
    @Arg("attendeeId") attendeeId: string,
    @Arg("eventId") eventId: string,
    @Ctx() ctx: MyContext
  ) {
    return await this.attendeeService.checkInAttendee(attendeeId, eventId, ctx);
  }

  @FieldResolver(() => User)
  async user(@Root() attendee: Attendee, @Ctx() ctx: MyContext) {
    return await ctx.loaders.attendeeUserLoader.load(attendee.userId);
  }

  @FieldResolver(() => Event)
  async event(@Root() attendee: Attendee, @Ctx() ctx: MyContext) {
    return await ctx.loaders.eventLoader.load(attendee.eventId);
  }

  @FieldResolver(() => TicketType)
  async ticketType(@Root() attendee: Attendee, @Ctx() ctx: MyContext) {
    return await ctx.loaders.ticketTypeLoader.load(attendee.ticketTypeId);
  }

  @FieldResolver(() => [Session])
  async sessions(@Root() attendee: Attendee, @Ctx() ctx: MyContext) {
    return await ctx.loaders.attendeeSessionsLoader.load(attendee.id);
  }
}
