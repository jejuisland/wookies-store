const express = require('express');
const bodyParser = require('body-parser');
const db = require('./src/database/db-connection');
const { authenticateToken, JWT_SECRET } = require('./src/auth/authentication');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());


app.get('/api/someEndpoint', (req, res) => {
    res.json({ message: 'Hello, World!' });
  });
  
// Registration route
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Check if the username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    // Hash the password before storing it in the database
    bcrypt.hash(password, 10, (bcryptErr, hashedPassword) => {
        if (bcryptErr) {
            console.error('Bcrypt error:', bcryptErr);
            return res.status(500).json({ message: 'Server error' });
        }

        // Store the hashed password in the database
        const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
        db.query(query, [username, hashedPassword], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            // User registered successfully
            return res.status(201).json({ message: 'Registration successful.' });
        });
    });
});


// Route for user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the authenticated user is "DarthVader"
    if (username === 'DarthVader') {
        return res.status(403).json({ message: 'Darth Vader is not allowed to publish, or login, or perform any action.' });
    }

    // Check if the username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    // Authenticate user by checking the credentials in the database
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        // Check if a user with the provided username exists
        if (results.length === 0) {
            return res.status(401).json({ message: 'Authentication failed. Invalid credentials.' });
        }

        const user = results[0];

        // Compare the provided password with the hashed password in the database
        bcrypt.compare(password, user.password, (bcryptErr, bcryptResult) => {
            if (bcryptErr) {
                console.error('Bcrypt error:', bcryptErr);
                return res.status(500).json({ message: 'Server error' });
            }

            // If the passwords match, generate and return a JWT token
            if (bcryptResult) {
                const token = jwt.sign({ username: user.username }, JWT_SECRET, {
                    expiresIn: '1h', // Token expiration time (adjust as needed)
                });
                return res.status(200).json({ token });
            } else {
                return res.status(401).json({ message: 'Authentication failed. Invalid credentials.' });
            }
        });
    });
});

// Route for create books
app.post('/books', authenticateToken, (req, res) => {
    // AuthenticateToken middleware ensures that only authenticated users can access this route

    const { title, author, price } = req.body;

    // Check if all required fields are provided
    if (!title || !author || !price) {
        return res.status(400).json({ message: 'Title, author, and price are required fields.' });
    }

    // Query to insert a new book into the database
    const query = 'INSERT INTO books (title, author, price) VALUES (?, ?, ?)';

    // Values to be inserted into the query
    const values = [title, author, price];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        // Return a success message with the ID of the newly created book
        const bookId = result.insertId;
        return res.status(201).json({ message: 'Book created successfully', bookId });
    });
});

// Route for update books
app.put('/books/:id', authenticateToken, (req, res) => {
    // AuthenticateToken middleware ensures that only authenticated users can access this route

    const bookId = req.params.id;
    const { title, author, price } = req.body;

    // Check if all required fields are provided
    if (!title || !author || !price) {
        return res.status(400).json({ message: 'Title, author, and price are required fields.' });
    }

    // Query to update the book in the database
    const query = 'UPDATE books SET title = ?, author = ?, price = ? WHERE id = ?';

    // Values to be updated in the query
    const values = [title, author, price, bookId];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        // Check if the book was found and updated
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Return a success message
        return res.status(200).json({ message: 'Book updated successfully' });
    });
});

// Route for delete books
app.delete('/books/:id', authenticateToken, (req, res) => {
    // AuthenticateToken middleware ensures that only authenticated users can access this route

    const bookId = req.params.id;

    // Query to delete the book from the database
    const query = 'DELETE FROM books WHERE id = ?';

    // Value to be deleted in the query
    const value = [bookId];

    db.query(query, value, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        // Check if the book was found and deleted
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Return a success message
        return res.status(200).json({ message: 'Book deleted successfully' });
    });
});

// GET all books (List resource)
app.get('/books', (req, res) => {
    const { title, author } = req.query;

    let query = 'SELECT * FROM books';
    const values = [];

    // Add search conditions if title or author query parameters are provided
    if (title) {
        query += ' WHERE title LIKE ?';
        values.push(`%${title}%`);
    }
    if (author) {
        if (values.length > 0) {
            query += ' AND';
        } else {
            query += ' WHERE';
        }
        query += ' author LIKE ?';
        values.push(`%${author}%`);
    }

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        // Return the list of books as JSON response
        return res.status(200).json(results);
    });
});

// GET a single book by ID (Detail resource)
app.get('/books/:id', (req, res) => {
    const bookId = req.params.id;

    // Query to retrieve a book by ID
    const query = 'SELECT * FROM books WHERE id = ?';

    // Value to be inserted into the query
    const value = [bookId];

    db.query(query, value, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        // Check if the book was found
        if (result.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Return the book as JSON response
        return res.status(200).json(result[0]);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Export the app instance for testing
module.exports = app;