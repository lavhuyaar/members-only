require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const path = require("node:path");
const session = require("express-session");
const passport = require("passport");
const indexRoute = require("./routes/indexRoute");
const LocalStrategy = require("passport-local").Strategy;
const pool = require("./db/pool");


const app = express();
const PORT = process.env.PORT || 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const assetsPath = path.join(__dirname, "/public");
app.use(express.static(assetsPath));

app.use(session({ secret: "user", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      const user = rows[0];
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password.trim());
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    const user = rows[0];
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use("/", indexRoute);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on Port ${PORT}!`);
});
