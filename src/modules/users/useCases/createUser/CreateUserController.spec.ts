import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import { ICreateUserDTO } from './ICreateUserDTO';

import createConnection from '../../../../database';

let connection:Connection;

describe('Create User Controller', () => {
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

  it('should be able to create a new user', async () => {
    const response = await request(app).post('/api/v1/users').send(userTest);

    expect(response.status).toBe(201);
  })
})
