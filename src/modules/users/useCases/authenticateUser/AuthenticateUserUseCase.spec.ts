import { ICreateUserDTO } from './../createUser/ICreateUserDTO';
import { InMemoryUsersRepository } from './../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from './../createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';

let usersRepositoryInMemory: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe('Authenticate User', () => {
  const userTest :ICreateUserDTO = {
    name: 'User Test',
    email: 'user@test.com.br',
    password: 'fake_password'
  }

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  })

  it ('should be able to authenticate a user', async () => {
    const { email } = await createUserUseCase.execute(userTest);

    const { user } = await authenticateUserUseCase.execute({ email, password: userTest.password });

    expect(user).toHaveProperty('id');
    expect(user.name).toEqual(userTest.name);
    expect(user.email).toEqual(userTest.email);
    expect(user).not.toHaveProperty('password');
  })
})
