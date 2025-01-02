import { Not } from "typeorm";
import { Event, EventStatus } from "../entities/event.entity";
import {
  CreateEventInput,
  EventFilterArgs,
  UpdateEventDatesInput,
  UpdateEventInput,
} from "../graphql/typeDefs/event.types";

import eventRepository, {
  EventRepository,
} from "../repositories/event.repository";
import { NotFoundError, UnauthorizedError } from "../utils/error";
import userService from "./user.service";
import venueService from "./venue.service";
import { MyContext } from "../utils/context";
import { Roles } from "../entities/user.entity";

export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async createEvent(data: CreateEventInput, userId: string, venueId: string) {
    const user = await userService.getUser(
      { id: userId },
      {
        organizerProfileId: true,
      }
    );

    const newEvent = new Event();
    Object.assign(newEvent, data);

    newEvent.organizerId = user.organizerProfileId;
    newEvent.venueId = venueId;

    const event = await this.eventRepository.save(newEvent);

    return event;
  }

  async getEvent(id: string) {
    const event = await this.eventRepository.findOne({
      where: {
        id,
        status: Not(EventStatus.DRAFT),
      },
    });

    return event ? event : null;
  }

  async getAllEvents(args: EventFilterArgs) {
    const { data, pagination } =
      await this.eventRepository.findPaginatedAndFilter(args);

    return {
      events: data,
      pagination,
    };
  }

  async updateEventDetails(id: string, data: UpdateEventInput, userId: string) {
    const user = await userService.getUser(
      { id: userId },
      { organizerProfileId: true }
    );

    const event = await this.eventRepository.findOne({
      where: { id, status: Not(EventStatus.DRAFT) },
    });

    if (user.organizerProfileId !== event.organizerId)
      throw new UnauthorizedError(
        "You do not have permission to perfom this action. Only the owner of the event can update the event"
      );
    //Check if venue exists
    if (data.venueId) {
      const venue = await venueService.getVenue(data.venueId);
    }

    const updatedEvent = await this.eventRepository.findOneAndUpdate(
      { id },
      data
    );

    if (!updatedEvent) throw new NotFoundError("No event found");

    return updatedEvent;
  }

  async updateEventDates(
    id: string,
    data: UpdateEventDatesInput,
    userId: string
  ) {
    const user = await userService.getUser(
      { id: userId },
      { organizerProfileId: true }
    );

    const event = await this.eventRepository.findOne({ where: { id } });

    if (user.organizerProfileId !== event.organizerId)
      throw new UnauthorizedError(
        "You do not have permission to perfom this action. Only the owner of the event can update the event"
      );

    const updatedEvent = await this.eventRepository.findOneAndUpdate(
      { id },
      data
    );

    if (!updatedEvent) throw new NotFoundError("No event found");

    return updatedEvent;
  }

  async getEventAttendees(eventId: string, ctx: MyContext) {
    if (ctx.role !== Roles.ADMIN && ctx.role !== Roles.ORGANIZER) {
      return null;
    }

    const event = await ctx.loaders.eventLoader.load(eventId);
    if (!event) return null;

    if (ctx.role === Roles.ADMIN)
      return await ctx.loaders.attendeeLoader.load(eventId);
    if (ctx.role === Roles.ORGANIZER) {
      if (ctx.organizerId !== event.organizerId) {
        return null;
      }
      return await ctx.loaders.attendeeLoader.load(eventId);
    }

    return null;
  }
}

export default new EventService(eventRepository);
