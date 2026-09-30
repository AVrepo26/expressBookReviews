const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');
let users = require('./auth_users.js').users;
const public_users = express.Router();

public_users.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });
  if (users.some((u) => u.username === username)) return res.status(409).json({ message: 'User already exists.' });
  users.push({ username, password });
  return res.status(201).json({ message: 'User successfully registered.' });
});

public_users.get('/', (req, res) => res.status(200).json(books));
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.status(200).json(book) : res.status(404).json({ message: 'Book not found.' });
});
public_users.get('/author/:author', (req, res) => {
  const author = decodeURIComponent(req.params.author).toLowerCase();
  const result = Object.values(books).filter((book) => book.author.toLowerCase() === author);
  return result.length ? res.status(200).json(result) : res.status(404).json({ message: 'No books found for this author.' });
});
public_users.get('/title/:title', (req, res) => {
  const title = decodeURIComponent(req.params.title).toLowerCase();
  const result = Object.values(books).filter((book) => book.title.toLowerCase() === title);
  return result.length ? res.status(200).json(result) : res.status(404).json({ message: 'No books found for this title.' });
});
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found.' });
  return Object.keys(book.reviews || {}).length ? res.status(200).json(book.reviews) : res.status(200).json({ message: 'No reviews found for this book.' });
});

const API_BASE = 'http://localhost:5000';
const getAllBooksAsync = async () => (await axios.get(API_BASE + '/')).data;
const getByISBNAsync = async (isbn) => (await axios.get(API_BASE + '/isbn/' + encodeURIComponent(isbn))).data;
const getByAuthorAsync = async (author) => (await axios.get(API_BASE + '/author/' + encodeURIComponent(author))).data;
const getByTitleAsync = async (title) => (await axios.get(API_BASE + '/title/' + encodeURIComponent(title))).data;
public_users.get('/async/books', async (req, res) => { try { res.json(await getAllBooksAsync()); } catch (e) { res.status(500).json({ message: e.message }); } });
public_users.get('/async/isbn/:isbn', async (req, res) => { try { res.json(await getByISBNAsync(req.params.isbn)); } catch (e) { res.status(404).json({ message: 'Book not found.' }); } });
public_users.get('/async/author/:author', async (req, res) => { try { res.json(await getByAuthorAsync(req.params.author)); } catch (e) { res.status(404).json({ message: 'No books found for this author.' }); } });
public_users.get('/async/title/:title', async (req, res) => { try { res.json(await getByTitleAsync(req.params.title)); } catch (e) { res.status(404).json({ message: 'No books found for this title.' }); } });

module.exports.general = public_users;
