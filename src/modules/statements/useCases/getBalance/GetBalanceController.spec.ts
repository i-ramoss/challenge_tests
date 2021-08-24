import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import { ICreateUserDTO } from '../../../users/useCases/createUser/ICreateUserDTO';
import { ICreateStatementDTO } from '../createStatement/ICreateStatementDTO';

import createConnection from '../../../../database';

let connection: Connection;

describe('Get Balance Controller', () => {
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

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to get a user balance by user token', async () => {
    await request(app).post('/api/v1/users').send(userTest);

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: userTest.email,
      password: userTest.password,
    });

    const { token } = responseToken.body;

    await request(app).post('/api/v1/statements/deposit')
      .send({ amount: 500, description: statementTest.description })
      .set({ Authorization: `Bearer ${token}` })

     await request(app).post('/api/v1/statements/withdraw')
      .send({ amount: 80, description: statementTest.description })
      .set({ Authorization: `Bearer ${token}` })

    const response = await request(app).get('/api/v1/statements/balance').set({ Authorization: `Bearer ${token}` })

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('statement');
    expect(response.body).toHaveProperty('balance');
    expect(response.body.statement.length).toBe(2);
    expect(response.body.balance).toBe(420);
  })
})
