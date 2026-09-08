const request = require('supertest');
const app = require('../src/app');
const { sequelize, User } = require('../src/models');

beforeAll(async () => {
  // Sync DB before tests run
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close connection after tests run
  await sequelize.close();
});

describe('Authentication API Endpoint Tests', () => {
  it('should successfully register a new user employee', async () => {
    // Seed default role
    const { Role } = require('../src/models');
    await Role.create({ id: 1, name: 'Employee', permissions: ['profile.view'] });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Engineer',
        email: 'testengineer@example.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toEqual('testengineer@example.com');
  });

  it('should reject login attempt with incorrect credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testengineer@example.com',
        password: 'WrongPassword'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message');
  });

  it('should authenticate user and return profile token on correct login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testengineer@example.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.role).toEqual('Employee');
  });
});
