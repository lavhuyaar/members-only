require("dotenv").config();
const express = require("express");
const path = require("node:path");
const session = require("express-session");
const passport = require("passport");
const indexRoute = require("./routes/indexRoute");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const assetsPath = path.join(__dirname, "/public");
app.use(express.static(assetsPath));

app.use(session({ secret: "users", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

app.use("/", indexRoute);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on Port ${PORT}!`);
});
