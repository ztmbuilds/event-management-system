import { FindOptionsWhere } from "typeorm";
import { Session } from "../entities/session.entity";
import { SessionFilterArgs } from "../graphql/typeDefs/session.types";
import { AbstractRepository } from "./abstract.repository";

export class SessionRepository extends AbstractRepository<Session> {
  async findPaginatedAndFilter(
    { page, size, order, orderBy, status }: SessionFilterArgs,
    eventId: string
  ) {
    let where: FindOptionsWhere<Session> = {
      eventId,
    };

    if (status) {
      where.status = status;
    }

    return await this.findPaginated(where, { page, size, order, orderBy });
  }
}

export default new SessionRepository(Session);
