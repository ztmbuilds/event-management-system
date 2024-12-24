import { DataSource } from "typeorm";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME } from "../config";
import { Event } from "../entities/event.entity";
import { User } from "../entities/user.entity";
import { Attendee } from "../entities/attendee.entity";
import { TicketType } from "../entities/ticket-type.entity";
import { Session } from "../entities/session.entity";
import { Venue } from "../entities/venue.entity";
import { Organizer } from "../entities/organizers.entity";
import { Speaker } from "../entities/speaker.entity";
import { Payment } from "../entities/payment.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: DB_PORT,
  password: DB_PASSWORD,
  database: DB_NAME,
  username: DB_USERNAME,
  entities: [
    Event,
    User,
    Attendee,
    TicketType,
    Session,
    Venue,
    Organizer,
    Speaker,
    Payment,
  ],
  logging: ["query", "error"],
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");

    return AppDataSource.synchronize().then(() => {
      console.log("synchronized!");
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
