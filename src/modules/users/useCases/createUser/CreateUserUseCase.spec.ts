import { CreateUserError } from './CreateUserError';
import { ICreateUserDTO } from './ICreateUserDTO';
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase"

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create User', () => {
  const userTest: ICreateUserDTO = {
    name: 'User Test',
    email: 'user@test.com.br',
    password: 'fake_password'
  }

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  })

  it('should be able to create a new user', async () => {
    const user = await createUserUseCase.execute(userTest);

    expect(user).toHaveProperty('id');
    expect(user.name).toEqual(userTest.name);
    expect(user.email).toEqual(userTest.email);
    expect(user.password).not.toEqual(userTest.password)
    expect(user.created_at).not.toBeNull();
    expect(user.updated_at).not.toBeNull();
  })

  it('should not be able to create a user with the same email', () => {
    expect(async () => {
      await createUserUseCase.execute(userTest);
      await createUserUseCase.execute(userTest);
    }).rejects.toBeInstanceOf(CreateUserError);
  })
})
