import { ShowUserProfileError } from './ShowUserProfileError';
import { InMemoryUsersRepository } from './../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from './../createUser/CreateUserUseCase';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';
import { ICreateUserDTO } from '../createUser/ICreateUserDTO';

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Show User Profile', () => {
  const userTest: ICreateUserDTO = {
    name: 'User Test',
    email: 'user@test.com.br',
    password: 'fake_password'
  }

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
  })

  it('should be able to show the data of an user by id', async () => {
    const user = await createUserUseCase.execute(userTest);

    const userFound = await showUserProfileUseCase.execute(user.id || "");

    expect(userFound).toHaveProperty('id');
    expect(userFound).toHaveProperty('password');
    expect(userFound.password).not.toEqual(userTest.password);
    expect(userFound.name).toEqual(userTest.name);
    expect(userFound.email).toEqual(userTest.email);
  })

  it('should not be able to show the data of an non-existent user', () => {
    expect( async () => {
      await showUserProfileUseCase.execute("");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  })
})
