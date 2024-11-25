import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Args,
  Ctx,
  Authorized,
  Root,
  FieldResolver,
} from "type-graphql";
import eventService, { EventService } from "../../services/event.service";
import { Event } from "../../entities/event.entity";
import {
  CreateEventInput,
  UpdateEventDatesInput,
  UpdateEventInput,
  EventFilterArgs,
  PaginatedEventResult,
} from "../typeDefs/event.types";
import { MyContext } from "../../utils/context";
import { Venue } from "../../entities/venue.entity";
import { Session } from "../../entities/session.entity";
import { TicketType } from "../../entities/ticket-type.entity";
import { Attendee } from "../../entities/attendee.entity";
import { Organizer } from "../../entities/organizers.entity";

@Resolver(() => Event)
export class EventResolver {
  eventService: EventService;
  constructor() {
    this.eventService = eventService;
  }

  @Query(() => PaginatedEventResult)
  async events(@Args(() => EventFilterArgs) filter: EventFilterArgs) {
    return await this.eventService.getAllEvents(filter);
  }

  @Query(() => Event || null)
  async event(@Arg("id") id: string) {
    return this.eventService.getEvent(id);
  }

  @Authorized(["ORGANIZER"])
  @Mutation(() => Event)
  async createEvent(
    @Arg("data") data: CreateEventInput,
    @Arg("venueId") venueId: string,
    @Ctx() ctx: MyContext
  ) {
    return await this.eventService.createEvent(data, ctx.id, venueId);
  }

  @Authorized(["ORGANIZER"])
  @Mutation(() => Event)
  async updateEvent(
    @Arg("id") id: string,
    @Arg("data") data: UpdateEventInput,
    @Ctx() ctx: MyContext
  ) {
    return await this.eventService.updateEventDetails(id, data, ctx.id);
  }

  @Authorized(["ORGANIZER"])
  @Mutation(() => Event)
  async updateEventDates(
    @Arg("id") id: string,
    @Arg("data") data: UpdateEventDatesInput,
    @Ctx() ctx: MyContext
  ) {
    return await this.eventService.updateEventDates(id, data, ctx.id);
  }

  @FieldResolver(() => Venue)
  async venue(@Root() event: Event, @Ctx() ctx: MyContext) {
    return await ctx.loaders.venueLoader.load(event.venueId);
  }

  @FieldResolver(() => [Session])
  async sessions(@Root() event: Event, @Ctx() ctx: MyContext) {
    return await ctx.loaders.sessionLoader.load(event.id);
  }

  @FieldResolver(() => [TicketType])
  async tickets(@Root() event: Event, @Ctx() ctx: MyContext) {
    return await ctx.loaders.ticketLoader.load(event.id);
  }

  @FieldResolver(() => [Attendee])
  async attendees(@Root() event: Event, @Ctx() ctx: MyContext) {
    return await this.eventService.getEventAttendees(event.id, ctx);
  }

  @FieldResolver(() => Organizer)
  async organizer(@Root() event: Event, @Ctx() ctx: MyContext) {
    return await ctx.loaders.organizerLoader.load(event.organizerId);
  }
}
