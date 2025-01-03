export const mockManager = {
  findOne: jest.fn(),
  softRemove: jest.fn(),
  save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
  restore: jest.fn(),
};

export const mockCommitTransaction = jest
  .fn()
  .mockImplementation(() => Promise.resolve());

export const mockQueryRunner = {
  startTransaction: jest.fn().mockImplementation(() => Promise.resolve()),
  commitTransaction: mockCommitTransaction,
  rollbackTransaction: jest.fn().mockImplementation(() => Promise.resolve()),
  connect: jest.fn().mockResolvedValue(null),
  release: jest.fn().mockImplementation(() => Promise.resolve()),
  manager: mockManager,
};
