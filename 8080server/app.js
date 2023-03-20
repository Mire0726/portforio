"use strict";

const express = require("express");
let app = express();

app.listen(8080, () => {
  console.log("Start Server!");
});

app.use(express.static("8080server"));

app.use("/", (req, res) => {
  console.log("Hello, express");
  res.sendFile(__dirname + "8080server/public/index.html");
  res.sendFile(__dirname + "8080server/public/style.css");
});

app.use("/works", (req, res) => {
  console.log("Hello, express");
  res.sendFile(__dirname + "8080server/works/works.html");
  res.sendFile(__dirname + "8080server/works/works.css");
});
