import {
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
} from "typeorm";
import { Roles, User } from "../entities/user.entity";

import { ConflictError, NotFoundError } from "../utils/error";

import userRepository, {
  UserRepository,
} from "../repositories/user.repository";
import { TransactionHandler } from "../utils/transaction";
import { Organizer } from "../entities/organizers.entity";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUser(
    where: FindOptionsWhere<User>,
    select?: FindOptionsSelect<User>,
    relations?: FindOptionsRelations<User>
  ) {
    const user = await this.userRepository.findOne({
      where,
      select,
      relations,
    });

    return user ? user : null;
  }

  async getUserWithOrganizerProfile(id: string) {
    return await this.getUser({ id }, undefined, {
      organizerProfile: true,
    });
  }

  async deleteOrganizerProfile(id: string) {
    const transactionHandler = new TransactionHandler();
    await transactionHandler.startTransaction("READ COMMITTED");

    return transactionHandler.executeInTransaction(
      async (transactionalEntityManager) => {
        const user = await transactionalEntityManager.findOne(User, {
          where: { id },
          relations: ["organizerProfile"],
        });

        if (!user) throw new NotFoundError("No user found");
        if (!user.organizerProfile)
          throw new ConflictError("User does not have an organizer Profile");
        await transactionalEntityManager.softRemove(user.organizerProfile);

        user.role = Roles.ATTENDEE;

        return await transactionalEntityManager.save(user);
      }
    );
  }

  async restoreOrganizerProfile(id: string) {
    const transactionHandler = new TransactionHandler();
    await transactionHandler.startTransaction("READ COMMITTED");

    await transactionHandler.executeInTransaction(
      async (transactionalEntityManager) => {
        const user = await transactionalEntityManager.findOne(User, {
          where: { id },
          relations: ["organizerProfile"],
        });

        if (!user) throw new NotFoundError("No user found");
        if (!user.organizerProfile)
          throw new NotFoundError(
            "No organizerProfile associated with this user"
          );

        await transactionalEntityManager.restore(
          Organizer,
          user.organizerProfileId
        );

        user.role = Roles.ORGANIZER;

        return await transactionalEntityManager.save(user);
      }
    );
  }
}

export default new UserService(userRepository);
