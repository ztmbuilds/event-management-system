import { AbstractRepository } from "./abstract.repository";
import { Event, EventStatus } from "../entities/event.entity";
import { Between, ArrayOverlap, Not, FindOptionsWhere } from "typeorm";
import { EventFilterArgs } from "../graphql/typeDefs/event.types";

// interface EventPaginatedArgs extends PaginatedArgs {
//   period?: {
//     startDate: Date;
//     endDate: Date;
//   };
//   tags: string[];
// }

export class EventRepository extends AbstractRepository<Event> {
  async findPaginatedAndFilter({
    page,
    size,
    order,
    orderBy,
    period,
    tags,
  }: EventFilterArgs) {
    let where: FindOptionsWhere<Event> = {
      status: Not(EventStatus.DRAFT),
    };

    if (tags && tags.length > 0) {
      where.tags = ArrayOverlap(tags);
    }

    if (period && period.startDate && period.endDate) {
      where.startDate = Between(
        new Date(period.startDate),
        new Date(period.endDate)
      );
    }

    return await this.findPaginated(where, { page, size, order, orderBy });
  }
}

export default new EventRepository(Event);
