import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import { ICreateUserDTO } from '../../../users/useCases/createUser/ICreateUserDTO';
import { ICreateStatementDTO } from '../createStatement/ICreateStatementDTO';

import createConnection from '../../../../database';

let connection: Connection;

describe('Create Statement Controller', () => {
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
    type: OperationType.DEPOSIT,
  }


  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to create a new deposit deposit statement', async () => {
    await request(app).post('/api/v1/users').send(userTest);

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: userTest.email,
      password: userTest.password,
    })

    const { user, token } = responseToken.body;

    const response = await request(app).post('/api/v1/statements/deposit')
      .send({ amount: 500, description: statementTest.description })
      .set({ Authorization: `Bearer ${token}` })

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.user_id).toEqual(user.id);
    expect(response.body.description).toEqual(statementTest.description);
    expect(response.body.type).toEqual(statementTest.type);
    expect(response.body.amount).toEqual(500);
  })

  it('should be able to create a new deposit withdraw statement', async () => {
    await request(app).post('/api/v1/users').send(userTest);

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: userTest.email,
      password: userTest.password,
    })

    const { user, token } = responseToken.body;

    const response = await request(app).post('/api/v1/statements/withdraw')
      .send({ amount: 200, description: statementTest.description })
      .set({ Authorization: `Bearer ${token}` })

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.user_id).toEqual(user.id);
    expect(response.body.description).toEqual(statementTest.description);
    expect(response.body.type).toEqual(OperationType.WITHDRAW);
    expect(response.body.amount).toEqual(200);
  })
})
