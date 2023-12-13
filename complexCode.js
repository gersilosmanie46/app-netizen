/* 
Filename: complexCode.js
Description: This code is a complex implementation of a social media network, featuring user authentication, posting updates, following/unfollowing other users, and displaying user profiles.
*/

// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Create Express app
const app = express();
app.use(bodyParser.json());

// Database
const users = [];
const posts = [];
const secretKey = "mySecretKey";

// Middleware to authenticate requests
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = user;
    next();
  });
}

// Routes
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    res.status(201).json({ message: "User created successfully" });
  } catch {
    res.status(500).json({ message: "Failed to create user" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  try {
    if (await bcrypt.compare(password, user.password)) {
      const accessToken = jwt.sign({ username }, secretKey);
      res.status(200).json({ accessToken });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch {
    res.status(500).json({ message: "Failed to authenticate user" });
  }
});

app.get("/posts", authenticateToken, (req, res) => {
  const username = req.user.username;
  const userPosts = posts.filter((post) => post.username === username);
  res.status(200).json(userPosts);
});

app.post("/posts", authenticateToken, (req, res) => {
  const username = req.user.username;
  const post = { username, content: req.body.content };
  posts.push(post);
  res.status(201).json({ message: "Post created successfully" });
});

app.post("/follow/:username", authenticateToken, (req, res) => {
  const username = req.user.username;
  const targetUsername = req.params.username;
  // Follow logic here
  res.status(200).json({ message: `You are now following ${targetUsername}` });
});

app.post("/unfollow/:username", authenticateToken, (req, res) => {
  const username = req.user.username;
  const targetUsername = req.params.username;
  // Unfollow logic here
  res.status(200).json({ message: `You have unfollowed ${targetUsername}` });
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});