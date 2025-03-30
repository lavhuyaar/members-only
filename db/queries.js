const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const pool = require("./pool");

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
      if (user.password !== password) {
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

//--------------------QUERIES---------------------

//Fetches all messages for Home page
const getAllMessages = async () => {
  const { rows } = await pool.query("SELECT * FROM messages");
  return rows;
};

//Signs-up a new user
const createNewUser = async (
  first_name,
  last_name,
  username,
  password,
  is_admin
) => {
  await pool.query(
    "INSERT INTO users (first_name, last_name, username, password, is_admin) VALUES ($1, $2, $3, $4, $5)",
    [first_name, last_name, username, password, is_admin]
  );
};

const addMessage = async (title, timestamp, message, added_by) => {
  await pool.query(
    "INSERT INTO messages (title, timestamp, message, added_by) VALUES ($1, $2, $3, $4)",
    [title, timestamp, message, added_by]
  );
};

const removeMessage = async (id) => {
  await pool.query("DELETE FROM messages WHERE id = $1", [id]);
};

const addUserToClub = async (id, username) => {
  await pool.query(
    "UPDATE users SET is_member = 'true' WHERE id = $1 AND username = $2",
    [id, username]
  );
};

module.exports = {
  getAllMessages,
  createNewUser,
  addMessage,
  removeMessage,
  addUserToClub,
};
