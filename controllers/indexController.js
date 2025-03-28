const db = require("../db/queries");
const bcrypt = require("bcryptjs");

//Gets all messages for Home page
exports.getMessages = async (req, res) => {
  const messages = await db.getAllMessages();

  res.render("index", {
    messages: messages,
  });
};

//Creates new user
exports.createUser = async (req, res, next) => {
  const { username, first_name, last_name, password, confirm_password } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.createNewUser(first_name, last_name, username, hashedPassword);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    next(err);
  }
};
