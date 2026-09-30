const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();
let users = [];
const JWT_SECRET = 'access';
const isValid = (username) => users.some((user) => user.username === username);
const authenticatedUser = (username, password) => users.some((user) => user.username === username && user.password === password);

regd_users.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password || !authenticatedUser(username, password)) return res.status(401).json({ message: 'Invalid username or password.' });
  const accessToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  req.session.authorization = { accessToken, username };
  return res.status(200).json({ message: 'Login successful.', accessToken });
});

regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  const username = req.user && req.user.username;
  const review = req.query.review || (req.body && req.body.review);
  if (!book) return res.status(404).json({ message: 'Book not found.' });
  if (!username) return res.status(401).json({ message: 'Unauthorized.' });
  if (!review) return res.status(400).json({ message: 'Review is required.' });
  book.reviews = book.reviews || {};
  book.reviews[username] = review;
  return res.status(200).json({ message: 'Review added or modified successfully.', reviews: book.reviews });
});

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  const username = req.user && req.user.username;
  if (!book) return res.status(404).json({ message: 'Book not found.' });
  if (!username) return res.status(401).json({ message: 'Unauthorized.' });
  if (!book.reviews || !Object.prototype.hasOwnProperty.call(book.reviews, username)) return res.status(404).json({ message: 'Review not found.' });
  delete book.reviews[username];
  return res.status(200).json({ message: 'Review deleted successfully.', reviews: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;
module.exports.JWT_SECRET = JWT_SECRET;
