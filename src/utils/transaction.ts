import { EntityManager, QueryRunner } from "typeorm";
import { AppDataSource } from "../database";

export class TransactionHandler {
  private readonly queryRunner: QueryRunner;
  constructor() {
    this.queryRunner = AppDataSource.createQueryRunner();
  }

  async startTransaction(
    level?:
      | "READ UNCOMMITTED"
      | "READ COMMITTED"
      | "REPEATABLE READ"
      | "SERIALIZABLE"
  ) {
    await this.queryRunner.connect();
    level
      ? await this.queryRunner.startTransaction(level)
      : await this.queryRunner.startTransaction();
  }

  async executeInTransaction<T>(
    work: (transactionalEntityManager: EntityManager) => Promise<void | T>
  ) {
    try {
      await work(this.queryRunner.manager);
      await this.queryRunner.commitTransaction();
    } catch (error) {
      await this.queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await this.queryRunner.release();
    }
  }
}
