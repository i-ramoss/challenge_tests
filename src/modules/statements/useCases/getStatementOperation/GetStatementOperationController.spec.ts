
import request from 'supertest';
import { v4 as uuidV4 } from 'uuid';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import { ICreateUserDTO } from '../../../users/useCases/createUser/ICreateUserDTO';
import { ICreateStatementDTO } from '../createStatement/ICreateStatementDTO';

import createConnection from '../../../../database';

let connection: Connection;

describe('Get Statement Operation Controller', () => {
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

  it('should be able to get an operation statement by id and token', async () => {
    await request(app).post('/api/v1/users').send(userTest);

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: userTest.email,
      password: userTest.password,
    })

    const { token } = responseToken.body;

    const responseDeposit = await request(app).post('/api/v1/statements/deposit')
      .send({ amount: 500, description: statementTest.description })
      .set({ Authorization: `Bearer ${token}` })

    const { id: deposit_id } = responseDeposit.body;

    const response = await request(app).get(`/api/v1/statements/${deposit_id}`).set({ Authorization: `Bearer ${token}` });


    expect(response.body).toHaveProperty("id")
    expect(response.body).toHaveProperty("user_id")
    expect(response.body.type).toBe(statementTest.type)
    expect(response.body.amount).toBe("500.00")
    expect(response.body.description).toBe(statementTest.description)
  })

  it('should not be able to get an operation statement from a non-authenticated user', async () => {
    await request(app).post('/api/v1/users').send(userTest);

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: userTest.email,
      password: userTest.password,
    })

    const { token } = responseToken.body;

    const responseDeposit = await request(app).post('/api/v1/statements/deposit')
      .send({ amount: 500, description: statementTest.description })
      .set({ Authorization: `Bearer ${token}` })

    const { id: deposit_id } = responseDeposit.body;

    const response = await request(app).get(`/api/v1/statements/${deposit_id}`).set({ Authorization: `Bearer Invalid-Token` });

    expect(response.status).toBe(401);
  }),

  it('should not be able to get an operation statement from a non-existent statement', async () => {
    await request(app).post('/api/v1/users').send(userTest);

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: userTest.email,
      password: userTest.password,
    })

    const { token } = responseToken.body;

    const response = await request(app).get(`/api/v1/statements/${uuidV4()}`).set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(404);
  })
})
