'use strict';

const Server = require('./index');
const request = require('supertest');

const PORT = 8000;
const url = `http://localhost:${PORT}`;
const server = new Server();

describe('Server test', () => {
  test('should respond with 404 and message for GET requests', async () => {
    const response = await request(server).get('/');
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe(
      'This Server only accepts POST requests; For the Sensor data.',
    );
  });

  test('should respond with 404 and message for POST requests with different url than /event', async () => {
    const response = await request(server).post('/something');
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe('The route "/something" does not exist');
  });

  /**
    * Shall we allow to receive readings with empty objects?
    * We do not want to break the client side.
    */
  test('should response 200 for a POST /event', async () => {
    const response = await request(server)
      .post('/event')
      .send({});
    expect(response.statusCode).toBe(200);
  });
});
