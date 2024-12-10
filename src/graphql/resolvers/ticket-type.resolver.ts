import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  Authorized,
  FieldResolver,
  Root,
} from "type-graphql";
import ticketTypeService, {
  TicketTypeService,
} from "../../services/ticket-type.service";
import { TicketType } from "../../entities/ticket-type.entity";
import { MyContext } from "../../utils/context";
import {
  CreateTicketTypeInput,
  UpdateTicketTypeInput,
  UpdateTicketTypeQuantityInput,
  UpdateTicketTypeSaleDatesInput,
} from "../typeDefs/ticket-type.types";
import { Roles } from "../../entities/user.entity";
import { Attendee } from "../../entities/attendee.entity";

@Resolver(() => TicketType)
export class TicketTypeResolver {
  ticketTypeService: TicketTypeService;
  constructor() {
    this.ticketTypeService = ticketTypeService;
  }

  @Query(() => [TicketType])
  async tickets(@Arg("eventId") eventId: string) {
    return await this.ticketTypeService.getAllTicketTypesForEvent(eventId);
  }

  @Query(() => TicketType, { nullable: true })
  async ticket(@Arg("id") id: string) {
    return await this.ticketTypeService.getTicketType(id);
  }

  @Authorized([Roles.ORGANIZER])
  @Mutation(() => TicketType)
  async createTicketType(
    @Arg("eventId") eventId: string,
    @Arg("data") data: CreateTicketTypeInput,
    @Ctx() ctx: MyContext
  ) {
    return await this.ticketTypeService.createTicketType(eventId, data, ctx);
  }

  @Authorized([Roles.ORGANIZER])
  @Mutation(() => TicketType)
  async updateTicketType(
    @Arg("id") id: string,

    @Arg("data") data: UpdateTicketTypeInput,
    @Ctx() ctx: MyContext
  ) {
    return await this.ticketTypeService.updateTicketType(
      id,

      data,
      ctx
    );
  }

  @Authorized([Roles.ORGANIZER])
  @Mutation(() => TicketType)
  async updateTicketTypeSaleDates(
    @Arg("id") id: string,

    @Arg("data") data: UpdateTicketTypeSaleDatesInput,
    @Ctx() ctx: MyContext
  ) {
    return await this.ticketTypeService.updateTicketType(
      id,

      data,
      ctx
    );
  }

  @Authorized([Roles.ORGANIZER])
  @Mutation(() => TicketType)
  async updateTicketTypeQuantity(
    @Arg("id") id: string,

    @Arg("data") data: UpdateTicketTypeQuantityInput,
    @Ctx() ctx: MyContext
  ) {
    return await this.ticketTypeService.updateTicketType(
      id,

      data,
      ctx
    );
  }

  @Authorized([Roles.ORGANIZER])
  @Mutation(() => TicketType)
  async deleteTicketType(@Arg("id") id: string, @Ctx() ctx: MyContext) {
    return await this.ticketTypeService.deleteTicketType(id, ctx);
  }

  @FieldResolver(() => Event)
  async event(@Root() ticket: TicketType, @Ctx() ctx: MyContext) {
    return await ctx.loaders.eventLoader.load(ticket.eventId);
  }

  @FieldResolver(() => [Attendee])
  async attendees(@Root() ticket: TicketType, @Ctx() ctx: MyContext) {
    return await ctx.loaders.attendeeLoader.load(ticket.id);
  }
}
