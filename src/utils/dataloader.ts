import DataLoader from "dataloader";
import { User } from "../entities/user.entity";
import userRepository from "../repositories/user.repository";
import eventRepository from "../repositories/event.repository";
import { In } from "typeorm";
import { Event } from "../entities/event.entity";

export const createLoaders = () => ({
  userLoader: new DataLoader<string, User>(async (organizerIds) => {
    const users = await userRepository.find({
      where: {
        organizerProfileId: In(organizerIds),
      },
    });

    const userMap = new Map(
      users.map((user) => [user.organizerProfileId, user])
    );

    return organizerIds.map((id) => userMap.get(id) || null);
  }),

  eventsLoader: new DataLoader<string, Event[]>(async (organizerIds) => {
    const events = await eventRepository.find({
      where: {
        organizerId: In(organizerIds),
      },
    });

    //group events by their organizerId using Map

    const eventMap = new Map<string, Event[]>();
    organizerIds.forEach((id) => eventMap.set(id, []));

    events.forEach((event) => {
      const organizerEvents = eventMap.get(event.organizerId) || [];
      organizerEvents.push(event);
      eventMap.set(event.organizerId, organizerEvents);
    });

    return organizerIds.map((id) => eventMap.get(id) || []);
  }),
});

export type Loaders = ReturnType<typeof createLoaders>;
