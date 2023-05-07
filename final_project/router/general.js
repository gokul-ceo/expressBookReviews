const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // if (!isValid(username)) {
  //   return res.status(400).json({ message: "Invalid username." });
  // }

  if (users.some((user) => user.username === username)) {
    return res.status(400).json({ message: "Username already exists." });
  }

  users.push({ username, password });

  return res.status(201).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  new Promise((resolve, reject) => {
    const bookList = Object.keys(books).map((key) => ({
      isbn: key,
      title: books[key].title,
    }));

    resolve(bookList);
  })
    .then((bookList) => {
      res.json(bookList);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Error fetching book list." });
    });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  const getBook = new Promise((resolve, reject) => {
    if (!books[isbn]) {
      reject({ message: "Book not found." });
    } else {
      const book = { isbn, ...books[isbn] };
      resolve(book);
    }
  });

  getBook
    .then((book) => {
      return res.json(book);
    })
    .catch((err) => {
      return res.status(404).json(err);
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;

  const getBooksByAuthor = new Promise((resolve, reject) => {
    const bookList = Object.keys(books)
      .filter((key) => books[key].author === author)
      .map((key) => ({ isbn: key, ...books[key] }));

    if (bookList.length > 0) {
      resolve(bookList);
    } else {
      reject("No books found for the given author.");
    }
  });

  getBooksByAuthor
    .then((bookList) => {
      return res.json(bookList);
    })
    .catch((error) => {
      return res.status(404).json({ message: error });
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;

  const bookListPromise = new Promise((resolve, reject) => {
    const filteredBooks = Object.keys(books).filter((key) =>
      books[key].title.includes(title)
    );

    if (filteredBooks.length === 0) {
      return reject({ status: 404, message: "No books found." });
    }

    const bookList = filteredBooks.map((key) => ({ isbn: key, ...books[key] }));

    return resolve(bookList);
  });

  bookListPromise
    .then((bookList) => {
      return res.json(bookList);
    })
    .catch((error) => {
      return res.status(error.status).json({ message: error.message });
    });
});

// Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  const reviews = books[isbn].reviews;

  return res.json(reviews);
});

module.exports.general = public_users;
