"use strict";

const express = require("express");
let app = express();

app.listen(8080, () => {
  console.log("Start Server!");
});

app.use(express.static("public"));

app.use("/", (req, res) => {
  console.log("Hello, express");
  res.sendFile(__dirname + "/public/index.html");
  res.sendFile(__dirname + "/public/style.css");
});
