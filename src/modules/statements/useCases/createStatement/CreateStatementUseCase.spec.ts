import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { InMemoryStatementsRepository } from './../../repositories/in-memory/InMemoryStatementsRepository';
import { ICreateUserDTO } from './../../../users/useCases/createUser/ICreateUserDTO';
import { ICreateStatementDTO } from './ICreateStatementDTO';
import { CreateStatementUseCase } from './CreateStatementUseCase';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { CreateStatementError } from "./CreateStatementError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

describe('Create Statement', () => {
  enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

  const statementTest: ICreateStatementDTO = {
    user_id: '123456',
    description: 'Statement test description',
    amount: 0,
    type: OperationType.WITHDRAW,
  }

  const userTest: ICreateUserDTO = {
    name: 'User Test',
    email: 'user@test.com.br',
    password: 'fake_password'
  }

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)
  })

  it('should be able to create a new statement', async () => {
    const user = await createUserUseCase.execute(userTest);

    const statement = await createStatementUseCase.execute({
      ...statementTest,
      user_id: `${user.id}`
    })

    expect(statement).toHaveProperty('id');
    expect(statement.user_id).toEqual(user.id);
    expect(statement.description).toEqual(statementTest.description);
    expect(statement.type).toEqual(statementTest.type);
    expect(statement.amount).toEqual(statementTest.amount);
  })

  it('should not be able to create a new statement for a non-existent user', () => {
    expect(async () => {
      await createStatementUseCase.execute(statementTest);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  })

  it('should not be able to create a new statement if the user has an invalid balance', async () => {
    const user = await createUserUseCase.execute(userTest);

    expect(async () => {
      const statement = await createStatementUseCase.execute({
        ...statementTest,
        amount: 3500,
        user_id: `${user.id}`
      })

      return statement;
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  })
})
