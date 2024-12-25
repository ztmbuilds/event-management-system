import DataLoader from "dataloader";
import { User } from "../entities/user.entity";
import userRepository from "../repositories/user.repository";
import eventRepository from "../repositories/event.repository";
import { FindOptionsRelations, FindOptionsWhere, In } from "typeorm";
import { Event } from "../entities/event.entity";
import { Venue } from "../entities/venue.entity";
import { Session } from "../entities/session.entity";
import venueRepository from "../repositories/venue.repository";
import sessionRepository from "../repositories/session.repository";
import ticketTypeRepository from "../repositories/ticket-type.repository";
import { TicketType } from "../entities/ticket-type.entity";
import { Attendee } from "../entities/attendee.entity";
import { Organizer } from "../entities/organizers.entity";
import attendeeRepository from "../repositories/attendee.repository";
import organizerRepository from "../repositories/organizer.repository";
import { Speaker } from "../entities/speaker.entity";
import speakerRepository from "../repositories/speaker.repository";
import { AbstractRepository } from "../repositories/abstract.repository";
import { AbstractEntity } from "../entities/abstract.entity";

function entityLoader<E extends AbstractEntity>(
  repository: AbstractRepository<E>,
  field: keyof E
) {
  return new DataLoader<string, E>(async (ids: readonly string[]) => {
    const entities = await repository.find({
      where: {
        [field]: In(ids),
      } as FindOptionsWhere<E>,
    });

    const map = new Map(
      entities.map((entity) => [entity[field] as string, entity])
    );

    return ids.map((id) => map.get(id) || null);
  });
}

function entitiesLoader<E extends AbstractEntity>(
  repository: AbstractRepository<E>,
  field: keyof E
) {
  return new DataLoader<string, E[]>(async (ids: readonly string[]) => {
    const entities = await repository.find({
      where: {
        [field]: In(ids),
      } as FindOptionsWhere<E>,
    });

    const map = new Map<string, E[]>();

    ids.forEach((id) => map.set(id, []));
    entities.forEach((entity) => {
      const items = map.get(entity[field] as string) || [];
      items.push(entity);

      map.set(entity[field] as string, items);
    });

    return ids.map((id) => map.get(id) || []);
  });
}

//not perfect. issue with field type.
function entitiesWithManyToManyRelationLoader<
  E extends AbstractEntity,
  R extends AbstractEntity
>(
  repository: AbstractRepository<E>,
  field: keyof AbstractEntity,
  relation: keyof E
) {
  return new DataLoader<string, E[]>(async (ids: readonly string[]) => {
    const entities = await repository.find({
      relations: {
        [relation]: true,
      } as FindOptionsRelations<E>,
      where: {
        [relation]: {
          [field]: In(ids),
        },
      } as FindOptionsWhere<E>,
    });

    const map = new Map<string, E[]>();

    ids.forEach((id) => map.set(id, []));
    entities.forEach((entity) => {
      (entity[relation] as R[]).forEach((relatedEntity: R) => {
        const items = map.get(relatedEntity[field] as string) || [];
        items.push(entity);

        map.set(entity[field] as string, items);
      });
    });

    return ids.map((id) => map.get(id) || []);
  });
}

export const createLoaders = () => {
  return {
    userLoader: entityLoader<User>(userRepository, "organizerProfileId"),

    sessionLoader: entitiesLoader<Session>(sessionRepository, "eventId"),

    eventsByOrganizerIdLoader: entitiesLoader<Event>(
      eventRepository,
      "organizerId"
    ),

    eventsByVenueIdLoader: entitiesLoader<Event>(eventRepository, "venueId"),

    eventLoader: entityLoader<Event>(eventRepository, "id"),

    venueLoader: entityLoader<Venue>(venueRepository, "id"),

    ticketLoader: entitiesLoader<TicketType>(ticketTypeRepository, "eventId"),

    ticketTypeLoader: entityLoader<TicketType>(ticketTypeRepository, "id"),

    attendeeLoader: entitiesLoader<Attendee>(attendeeRepository, "eventId"),

    attendeeUserLoader: entityLoader<User>(userRepository, "id"),

    organizerLoader: entityLoader<Organizer>(organizerRepository, "id"),

    speakerLoader: entitiesWithManyToManyRelationLoader<Speaker, Session>(
      speakerRepository,
      "id",
      "sessions"
    ),

    sessionAttendeesLoader: entitiesWithManyToManyRelationLoader<
      Attendee,
      Session
    >(attendeeRepository, "id", "sessions"),
    attendeeSessionsLoader: entitiesWithManyToManyRelationLoader<
      Session,
      Attendee
    >(sessionRepository, "id", "attendees"),
  };
};

export type Loaders = ReturnType<typeof createLoaders>;
