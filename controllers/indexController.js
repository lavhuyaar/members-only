const db = require("../db/queries");
const bcrypt = require("bcryptjs");

//Gets all messages for Home page
exports.getMessages = async (req, res) => {
  const messages = await db.getAllMessages();

  res.render("index", {
    messages: messages,
    user: req.user,
  });
};

//Creates new user
exports.createUser = async (req, res, next) => {
  const {
    username,
    first_name,
    last_name,
    password,
    confirm_password,
    is_admin,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.createNewUser(
      first_name,
      last_name,
      username,
      hashedPassword,
      is_admin
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

exports.renderAddMessage = (req, res) => {
  if (!req.user) return res.redirect("/login");
  else res.render("addMessage", { user: req.user });
};

exports.addMessage = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const { title, message } = req.body;

  // Returns date in proper format dd-MM-yyyy hours:minutes AM/PM
  const date = () => {
    const convertedDate = new Date();
    const date = convertedDate.getDate();
    const month = convertedDate.getMonth() + 1;
    const year = convertedDate.getFullYear();
    let hours = convertedDate.getHours();
    const minutes = convertedDate.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // Handle midnight (0 hours)

    const formattedDate = `${date <= 9 ? "0" : ""}${date}-${
      month <= 9 ? "0" : ""
    }${month}-${year}`;

    const formattedTime = `${hours <= 9 ? "0" : ""}${hours}:${
      minutes <= 9 ? "0" : ""
    }${minutes}${ampm}`;
    return `${formattedDate} ${formattedTime}`;
  };

  await db.addMessage(title, date(), message, req.user.username);
  res.redirect("/");
};

exports.deleteMessage = async (req, res) => {
  if (!req.user || req.user.is_admin !== "true")
    return res.status(404).redirect("/");

  const { id } = req.params;

  await db.removeMessage(id);
  res.redirect("/");
};

exports.renderJoinPage = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  if (req.user && req.user.is_admin === "true")
    return res.render("memberJoin", {
      user: req.user,
      status:
        "You don't need to join the members club as you're already an admin",
    });
  if (req.user && req.user.is_member === "true") {
    return res.render("memberJoin", {
      user: req.user,
      status: "You are a member of Club",
    });
  }

  return res.render("memberJoin", {
    user: req.user,
    status: "Join the Club by entering the secret the secret code below",
  });
};

exports.joinMembership = async (req, res) => {
  if (!req.user) return res.status(404).redirect("/login");

  if (
    req.user &&
    (req.user.is_admin === "true" || req.user.is_member === "true")
  ) {
    return res.status(404).redirect("/");
  }
  if (req.body.clubSecret !== process.env.CLUB_SECRET_KEY)
  return res.status(404).redirect("/member-join");
  
  
  
  await db.addUserToClub(req.user.id, req.user.username);
  res.render("/member-join", {user: req.user, status: "Welcome to the club"})
};
