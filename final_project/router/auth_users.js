const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  const user = users.find((u) => u.username === username);
  return !!user;
};

const authenticatedUser = (username) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  const user = users.find((u) => u.username === username);
  if (!user) return false;
  return true;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  console.log("Users list: ", users);
  const { username, password } = req.body;
  console.log();
  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }
  if (!authenticatedUser(username)) {
    return res.status(401).json({ message: "Invalid password" });
  }
  const accessToken = jwt.sign(
    { username: username },
    process.env.ACCESS_TOKEN_SECRET
  );
  return res.status(200).json({ accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { rating, review } = req.body;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  book.reviews[req.username] = { rating, review };
  return res.status(200).json({ message: "Review added successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;
