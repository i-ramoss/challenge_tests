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
    TRANSFER = 'transfer',
  }

  const statementTest: ICreateStatementDTO = {
    user_id: '',
    description: 'Statement test description',
    amount: 0,
    type: OperationType.DEPOSIT,
  }

  const userTest: ICreateUserDTO = {
    name: 'User Test',
    email: 'user@test.com.br',
    password: 'fake_password'
  }

  const userTest02: ICreateUserDTO = {
    name: 'User Test 02',
    email: 'user_02@test.com.br',
    password: 'fake_password'
  }

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)
  })

  it('should be able to create a new deposit statement', async () => {
    const user = await createUserUseCase.execute(userTest);

    const depositStatement = await createStatementUseCase.execute({
      ...statementTest,
      user_id: `${user.id}`,
      amount: 50
    })

    expect(depositStatement).toHaveProperty('id');
    expect(depositStatement.user_id).toEqual(user.id);
    expect(depositStatement.sender_id).toEqual(undefined);
    expect(depositStatement.description).toEqual(statementTest.description);
    expect(depositStatement.type).toEqual(statementTest.type);
    expect(depositStatement.amount).toEqual(50);
  })

  it('should be able to create a new withdraw statement', async () => {
    const user = await createUserUseCase.execute(userTest);

    const depositStatement = await createStatementUseCase.execute({
      ...statementTest,
      user_id: `${user.id}`,
      amount: 50,
    })

    const withdrawStatement = await createStatementUseCase.execute({
      ...statementTest,
      user_id: `${user.id}`,
      type: OperationType.WITHDRAW,
      amount: 30,
    })

    expect(withdrawStatement).toHaveProperty('id');
    expect(withdrawStatement.user_id).toEqual(user.id);
    expect(withdrawStatement.sender_id).toEqual(undefined);
    expect(withdrawStatement.description).toEqual(statementTest.description);
    expect(withdrawStatement.type).toEqual('withdraw');
    expect(withdrawStatement.amount).toEqual(30);
  })

  it('should be able to create a new transfer statement', async () => {
    const user01 = await createUserUseCase.execute(userTest);
    const user02 = await createUserUseCase.execute(userTest02);

    const depositStatement = await createStatementUseCase.execute({
      ...statementTest,
      user_id: `${user01.id}`,
      amount: 50,
    })

    const transferStatement = await createStatementUseCase.execute({
      ...statementTest,
      sender_id: `${user01.id}`,
      type: OperationType.TRANSFER,
      amount: 30,
    })

    expect(transferStatement).toHaveProperty('id');
    expect(transferStatement.sender_id).toEqual(user01.id);
    expect(transferStatement.description).toEqual(statementTest.description);
    expect(transferStatement.type).toEqual('transfer');
    expect(transferStatement.amount).toEqual(30);
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
