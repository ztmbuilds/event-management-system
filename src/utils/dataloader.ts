import DataLoader from "dataloader";
import { User } from "../entities/user.entity";
import userRepository from "../repositories/user.repository";
import eventRepository from "../repositories/event.repository";
import { In } from "typeorm";
import { Event } from "../entities/event.entity";
import { Venue } from "../entities/venue.entity";
import { Session } from "../entities/session.entity";
import venueRepository from "../repositories/venue.repository";
import sessionRepository from "../repositories/session.repository";
import ticketTypeRepository from "../repositories/ticketType.repository";
import { TicketType } from "../entities/ticket-type.entity";
import { Attendee } from "../entities/attendee.entity";
import { Organizer } from "../entities/organizers.entity";
import attendeeRepository from "../repositories/attendee.repository";
import organizerRepository from "../repositories/organizer.repository";
import { Speaker } from "../entities/speaker.entity";
import speakerRepository from "../repositories/speaker.repository";

const createEventsLoader = (field: keyof Event) => {
  return new DataLoader<string, Event[]>(async (ids) => {
    const events = await eventRepository.find({
      where: {
        [field]: In(ids),
      },
    });

    //group events

    const eventMap = new Map<string, Event[]>();
    ids.forEach((id) => eventMap.set(id, []));

    events.forEach((event) => {
      const key = event[field] as string;
      const events = eventMap.get(key) || [];
      events.push(event);
      eventMap.set(key, events);
    });

    return ids.map((id) => eventMap.get(id) || []);
  });
};

export const createLoaders = () => {
  return {
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

    eventsByOrganizerIdLoader: createEventsLoader("organizerId"),

    eventsByVenueIdLoader: createEventsLoader("venueId"),

    eventLoader: new DataLoader<string, Event>(async (eventIds) => {
      const events = await eventRepository.find({
        where: {
          id: In(eventIds),
        },
      });
      const eventMap = new Map<string, Event>(
        events.map((event) => [event.id, event])
      );

      return eventIds.map((id) => eventMap.get(id) || null);
    }),

    venueLoader: new DataLoader<string, Venue>(async (venueIds) => {
      const venues = await venueRepository.find({
        where: {
          id: In(venueIds),
        },
      });

      const venueMap = new Map<string, Venue>(
        venues.map((venue) => [venue.id, venue])
      );

      return venueIds.map((id) => venueMap.get(id));
    }),

    sessionLoader: new DataLoader<string, Session[]>(async (eventIds) => {
      const sessions = await sessionRepository.find({
        where: {
          eventId: In(eventIds),
        },
      });

      const sessionMap = new Map<string, Session[]>();

      eventIds.forEach((id) => sessionMap.set(id, []));

      sessions.forEach((session) => {
        const eventSessions = sessionMap.get(session.id) || [];

        eventSessions.push(session);

        sessionMap.set(session.eventId, eventSessions);
      });

      return eventIds.map((id) => sessionMap.get(id) || []);
    }),

    speakerLoader: new DataLoader<string, Speaker[]>(async (sessionIds) => {
      const speakers = await speakerRepository.find({
        relations: {
          sessions: true,
        },
        where: {
          sessions: {
            id: In(sessionIds),
          },
        },
      });

      const speakerMap = new Map<string, Speaker[]>();

      sessionIds.forEach((id) => speakerMap.set(id, []));

      speakers.forEach((speaker) => {
        speaker.sessions.forEach((session) => {
          const sessionSpeakers = speakerMap.get(session.id) || [];
          sessionSpeakers.push(speaker);
          speakerMap.set(session.id, sessionSpeakers);
        });
      });

      return sessionIds.map((id) => speakerMap.get(id) || []);
    }),

    sessionAttendeesLoader: new DataLoader<string, Attendee[]>(
      async (sessionIds) => {
        const attendees = await attendeeRepository.find({
          relations: {
            sessions: true,
          },
          where: {
            sessions: {
              id: In(sessionIds),
            },
          },
        });

        const sessionAttendeesMap = new Map<string, Attendee[]>();
        sessionIds.forEach((id) => sessionAttendeesMap.set(id, []));

        attendees.forEach((attendee) => {
          attendee.sessions.forEach((session) => {
            const sessionAttendees = sessionAttendeesMap.get(session.id);
            sessionAttendees.push(attendee);
            sessionAttendeesMap.set(session.id, sessionAttendees);
          });
        });

        return sessionIds.map((id) => sessionAttendeesMap.get(id) || []);
      }
    ),

    ticketLoader: new DataLoader<string, TicketType[]>(async (eventIds) => {
      const ticketTypes = await ticketTypeRepository.find({
        where: {
          eventId: In(eventIds),
        },
      });

      const ticketTypeMap = new Map<string, TicketType[]>();

      eventIds.forEach((id) => ticketTypeMap.set(id, []));

      ticketTypes.forEach((ticketType) => {
        const eventTicketTypes = ticketTypeMap.get(ticketType.eventId) || [];

        eventTicketTypes.push(ticketType);

        ticketTypeMap.set(ticketType.eventId, eventTicketTypes);
      });

      return eventIds.map((eventId) => ticketTypeMap.get(eventId) || []);
    }),

    attendeeLoader: new DataLoader<string, Attendee[]>(async (eventIds) => {
      const attendees = await attendeeRepository.find({
        where: {
          eventId: In(eventIds),
        },
      });

      const attendeeMap = new Map<string, Attendee[]>();

      eventIds.forEach((id) => attendeeMap.set(id, []));

      attendees.forEach((attendee) => {
        const eventAttendees = attendeeMap.get(attendee.eventId) || [];
        eventAttendees.push(attendee);

        attendeeMap.set(attendee.eventId, eventAttendees);
      });

      return eventIds.map((id) => attendeeMap.get(id) || []);
    }),

    organizerLoader: new DataLoader<string, Organizer>(async (organizerIds) => {
      const organizers = await organizerRepository.find({
        where: {
          id: In(organizerIds),
        },
      });

      const organizerMap = new Map<string, Organizer>(
        organizers.map((organizer) => [organizer.id, organizer])
      );

      return organizerIds.map((id) => organizerMap.get(id) || null);
    }),
  };
};

export type Loaders = ReturnType<typeof createLoaders>;
