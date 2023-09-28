const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { authenticateToken, JWT_SECRET } = require('../src/auth/authentication');

describe('Authentication Middleware', () => {
    const mockRequest = () => {
        const req = {};
        req.headers = {};
        return req;
    };

    const mockResponse = () => {
        const res = {};
        res.sendStatus = jest.fn();
        return res;
    };

    const mockNext = jest.fn();

    const mockToken = jwt.sign({ username: 'testUser' }, JWT_SECRET);

    // Test Case 2: Missing Token
    it('should return 401 Unauthorized if the token is missing', () => {
        const req = mockRequest();
        const res = mockResponse();

        authenticateToken(req, res, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(res.sendStatus).toHaveBeenCalledWith(401);
    });

    // Test Case 3: Invalid Token
    it('should return 403 Forbidden if the token is invalid', () => {
        const req = mockRequest();
        req.headers.authorization = 'InvalidToken';
        const res = mockResponse();

        authenticateToken(req, res, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(res.sendStatus).toHaveBeenCalledWith(403);
    });
});
