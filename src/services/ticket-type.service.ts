import { TicketType } from "../entities/ticket-type.entity";
import {
  CreateTicketTypeInput,
  UpdateTicketTypeSaleDatesInput,
  UpdateTicketTypeInput,
  UpdateTicketTypeQuantityInput,
} from "../graphql/typeDefs/ticket-type.types";
import ticketTypeRepository, {
  TicketTypeRepository,
} from "../repositories/ticket-type.repository";
import { MyContext } from "../utils/context";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/error";

import eventService from "./event.service";

export class TicketTypeService {
  constructor(private readonly ticketTypeRepository: TicketTypeRepository) {}

  async createTicketType(
    eventId: string,
    data: CreateTicketTypeInput,
    ctx: MyContext
  ) {
    const event = await eventService.getEvent(eventId);

    if (!ctx.organizerId || ctx.organizerId !== event.organizerId)
      throw new UnauthorizedError(
        "You do not have permission to perfom this action"
      );

    let newTicketType = new TicketType();

    newTicketType = Object.assign(newTicketType, data);
    newTicketType.eventId = eventId;

    return await this.ticketTypeRepository.save(newTicketType);
  }

  async updateTicketType(
    id: string,
    data:
      | UpdateTicketTypeInput
      | UpdateTicketTypeSaleDatesInput
      | UpdateTicketTypeQuantityInput,
    ctx: MyContext
  ) {
    const ticket = await this.ticketTypeRepository.findOne({
      where: {
        id,
      },
      relations: {
        event: true,
      },
    });

    if (!ticket) throw new NotFoundError("ticket not found");

    if (
      !ctx.organizerId ||
      !ticket.event ||
      ticket.event.organizerId !== ctx.organizerId
    )
      throw new UnauthorizedError(
        "You do not have permission to perform this action"
      );

    const updatedTicket = await this.ticketTypeRepository.findOneAndUpdate(
      {
        id,
      },
      data
    );

    if (!updatedTicket) throw new NotFoundError("ticket not found");

    return updatedTicket;
  }

  async deleteTicketType(id: string, ctx: MyContext) {
    const ticket = await this.ticketTypeRepository.findOne({
      where: {
        id,
      },
      relations: {
        attendees: true,
        event: true,
      },
    });

    if (!ticket) throw new NotFoundError("ticket not found");

    if (!ctx.organizerId || ticket.event.organizerId !== ctx.organizerId)
      throw new UnauthorizedError(
        "You do not have permission to perform this action"
      );

    if (!ticket) throw new NotFoundError("No ticket found");

    if (ticket.attendees.length > 0)
      throw new ConflictError(
        "You cannot delete a ticket type that has attendees"
      );

    const { status } = await this.ticketTypeRepository.findOneAndDelete({
      id,
    });

    if (!status) throw new NotFoundError("No ticket found");

    return ticket;
  }

  async getAllTicketTypesForEvent(eventId: string) {
    return await this.ticketTypeRepository.find({
      where: {
        eventId,
      },
    });
  }

  async getTicketType(id: string) {
    const ticketType = await this.ticketTypeRepository.findOne({
      where: {
        id,
      },
    });

    return ticketType ? ticketType : null;
  }
}
export default new TicketTypeService(ticketTypeRepository);
