import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import { ICreateUserDTO } from './../createUser/ICreateUserDTO';

import createConnection from '../../../../database';

let connection:Connection;

describe('Authenticate User Controller', () => {
  const userTest: ICreateUserDTO = {
    name: 'User Test',
    email: 'user@test.com.br',
    password: 'fake_password'
  }

  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to authenticate an user', async() => {
    await request(app).post('/api/v1/users').send(userTest);

    const response = await request(app).post('/api/v1/sessions').send({
      email: userTest.email,
      password: userTest.password
    })

    const { user } = response.body;

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('id');
    expect(user.name).toEqual(userTest.name);
    expect(user.email).toEqual(userTest.email);
    expect(user).not.toHaveProperty('password');
  })
})
