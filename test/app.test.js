const express = require('express');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Import your Express app instance

chai.use(chaiHttp);
const expect = chai.expect;
const jwt = require('jsonwebtoken');
const { authenticateToken, JWT_SECRET } = require('../src/auth/authentication');

const mockToken = jwt.sign({ username: 'wookies3' }, JWT_SECRET);

describe('Express App', () => {
  // Before running the tests, start your server or set up a testing database

  // Test for the /api/someEndpoint route
  it('should return "Hello, World!" for GET /api/someEndpoint', (done) => {
    chai
      .request(app)
      .get('/api/someEndpoint')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal('Hello, World!');
        done();
      });
  });

  // Test registration route
  it('should register a new user for POST /register', (done) => {
    chai
      .request(app)
      .post('/register')
      .send({ username: 'testuser', password: 'testpassword' })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.message).to.equal('Registration successful.');
        done();
      });
  });

  // Test login route
  it('should authenticate a user for POST /login', (done) => {
    chai
      .request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'testpassword' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token');
        done();
      });
  });

  // Test creating a new book
  it('should create a new book for POST /books', (done) => {
    chai
      .request(app)
      .post('/books')
      .set('Authorization', `Bearer ${mockToken}`) // Replace with a valid JWT token
      .send({ title: 'Test Book', author: 'Test Author', price: 19.99 })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.message).to.equal('Book created successfully');
        expect(res.body).to.have.property('bookId');
        done();
      });
  });
});
