import { InMemoryStatementsRepository } from './../../repositories/in-memory/InMemoryStatementsRepository';
import { InMemoryUsersRepository } from './../../../users/repositories/in-memory/InMemoryUsersRepository';
import { CreateStatementUseCase } from './../createStatement/CreateStatementUseCase';
import { CreateUserUseCase } from './../../../users/useCases/createUser/CreateUserUseCase';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';
import { ICreateUserDTO } from '../../../users/useCases/createUser/ICreateUserDTO';
import { ICreateStatementDTO } from '../createStatement/ICreateStatementDTO';
import { GetStatementOperationError } from './GetStatementOperationError';

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe('Get statement operation', () => {
  enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

  const userTest: ICreateUserDTO = {
    name: 'User Test',
    email: 'user@test.com.br',
    password: 'fake_password'
  }

  const statementTest: ICreateStatementDTO = {
    user_id: '123456',
    description: 'Statement test description',
    amount: 0,
    type: OperationType.WITHDRAW,
  }

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
  })

  it('should be able to get an operation statement by id', async () => {
    const user = await createUserUseCase.execute(userTest);

    const statement = await createStatementUseCase.execute({
      ...statementTest,
      user_id: `${user.id}`
   });

    const operation = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string
    });

    expect(operation).toHaveProperty("id")
    expect(operation).toHaveProperty("user_id")
    expect(operation.type).toBe(statementTest.type)
    expect(operation.amount).toBe(statementTest.amount)
    expect(operation.description).toBe(statementTest.description)
  })

  it('should not be able to get an operation statement from a non-existent user', async () => {
    const user = await createUserUseCase.execute(userTest);

    const statement = await createStatementUseCase.execute({
      ...statementTest,
      user_id: `${user.id}`
   });

   expect(async () => {
     await getStatementOperationUseCase.execute({
       user_id: 'invalid_user_id',
       statement_id: statement.id as string
     })
   }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it('should not be able to get an operation statement from a non-existent statement', async () => {
    const user = await createUserUseCase.execute(userTest);

    await createStatementUseCase.execute({
      ...statementTest,
      user_id: `${user.id}`
   });

   expect(async () => {
     await getStatementOperationUseCase.execute({
       user_id: user.id as string,
       statement_id: 'invalid_statement_id'
     })
   }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})
