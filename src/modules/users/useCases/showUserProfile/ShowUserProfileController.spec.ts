import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import { ICreateUserDTO } from './../createUser/ICreateUserDTO';

import createConnection from '../../../../database';

let connection: Connection;

describe('Show User Profile Controller', () => {
  const userTest: ICreateUserDTO = {
    name: 'User Test',
    email: 'user@test.com.br',
    password: 'fake_password'
  }

  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  })

  afterAll(async() => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to show a profile to an authenticated user by token', async () => {
    await request(app).post('/api/v1/users').send(userTest);

    const responseToken = await request(app).post('/api/v1/sessions').send(userTest);

    const { token } = responseToken.body;

    const response = await request(app).get('/api/v1/profile').set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toEqual(userTest.name);
    expect(response.body.email).toEqual(userTest.email);
    expect(response.body).not.toHaveProperty('password');
    expect(response.body.created_at).not.toBeNull();
    expect(response.body.updated_at).not.toBeNull();
  })

  it('should not be able to show a profile of a non-authenticated user', async () => {
    const response = await request(app).get('/api/v1/profile').set({ Authorization: `Bearer Inexistent-Token` });

    expect(response.status).toBe(401);
  })
})
