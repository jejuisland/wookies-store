
const crypto = require('crypto'); // Import the crypto module
const jwt = require('jsonwebtoken');

// JWT Secret Key
const secretKey = crypto.randomBytes(32).toString('hex');
const JWT_SECRET = secretKey;


// Authentication Middleware
function authenticateToken(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }

        req.user = user;
        next();
    });
}

module.exports = {
    authenticateToken,
    JWT_SECRET,
};
