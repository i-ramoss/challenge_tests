import { InMemoryUsersRepository } from './../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from './../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateUserUseCase } from './../../../users/useCases/createUser/CreateUserUseCase';
import { CreateStatementUseCase } from './../createStatement/CreateStatementUseCase';
import { GetBalanceUseCase } from './GetBalanceUseCase';
import { ICreateUserDTO } from '../../../users/useCases/createUser/ICreateUserDTO';
import { ICreateStatementDTO } from '../createStatement/ICreateStatementDTO';

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositorInMemory: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe('Get User Balance', () => {
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
    statementsRepositorInMemory = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositorInMemory)
    getBalanceUseCase = new GetBalanceUseCase(statementsRepositorInMemory, usersRepositoryInMemory);
  })

  it('should be able to get a user balance', async () => {
    const user = await createUserUseCase.execute(userTest);

    const statement = await createStatementUseCase.execute({
      ...statementTest,
      user_id: `${user.id}`
    })

    const balance = await getBalanceUseCase.execute({ user_id: user.id as string });

    expect(balance).toHaveProperty('balance')
    expect(balance.statement).toEqual(expect.arrayContaining([statement]));
  })
})
