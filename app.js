require("dotenv").config();
const express = require("express");
const path = require("node:path");

const app = express();
const PORT = process.env.PORT || 3000;

const assetsPath = path.join(__dirname, "/public");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on Port ${PORT}!`);
});
