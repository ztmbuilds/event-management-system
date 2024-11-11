import { FindOptionsSelect, IsNull, Not, Repository } from "typeorm";
import { Roles, User } from "../entities/user.entity";
import { AppDataSource } from "../database";
import { NotFoundError } from "../utils/error";
import organizerService from "./organizer.service";

export class UserService {
  private userRepository: Repository<User>;
  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async getUserById(id: string, selectOptions?: FindOptionsSelect<User>) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: selectOptions,
    });

    if (!user) throw new NotFoundError("User not found");

    return user;
  }

  async deleteOrganizerProfile(id: string) {
    const user = await this.getUserById(id, {
      id: true,
      role: true,
      organizerProfileId: true,
    });
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      await organizerService.deleteProfile(
        user.organizerProfileId,
        transactionalEntityManager
      );

      user.role = Roles.ATTENDEE;

      await transactionalEntityManager.save(user);
    });

    return user;
  }

  async restoreOrganizerProfile(id: string) {
    const user = await this.getUserById(id);

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      await organizerService.restoreProfile(
        user.organizerProfileId,
        transactionalEntityManager
      );

      user.role = Roles.ORGANIZER;

      await transactionalEntityManager.save(user);
    });
    return user;
  }
}
export default new UserService();
