const db = require("../db/queries");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { body, validationResult } = require("express-validator");

const validateSignup = [
  body("first_name")
    .trim()
    .isAlpha()
    .withMessage("First name must only letters")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("last_name")
    .trim()
    .isAlpha()
    .withMessage("Last name must only letters")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("username")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Username must be between 2 and 50 characters"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be atleast 6 letters"),
  body("confirm_password")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords must match"),
  body("is_admin")
    .isBoolean()
    .withMessage("Please select whether you want to be admin"),
];

const validateMessage = [
  body("title")
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage("Title must be between 5 and 50 letters"),
  body("message")
    .trim()
    .isLength({ min: 5, max: 250 })
    .withMessage("Message must be between 5 and 250 letters"),
];

//Gets all messages for Home page
exports.getMessages = async (req, res) => {
  const messages = await db.getAllMessages();
  res.render("index", {
    messages: messages,
    user: req.user,
  });
};

//Creates new user
exports.createUser = [
  validateSignup,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(404).render("sign-up", { errors: errors.array() });

    const { username, first_name, last_name, password, is_admin } = req.body;

    //Checks if username already exists
    const isUsernameUnavailable = await db.checkUsernames(username);
    if (isUsernameUnavailable.length > 0) {
      return res.status(404).render("sign-up", {
        errors: [{ msg: "This username already exists" }],
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10); //Hashed password
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
  },
];

//Logs out user
exports.logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

//Renders add message page
exports.renderAddMessage = (req, res) => {
  if (!req.user) return res.redirect("/login");
  else res.render("addMessage", { user: req.user });
};

//Renders sign up page
exports.renderSignUp = (req, res) => res.render("sign-up", { user: req.user });

//Renders login page
exports.renderLoginPage = (req, res) => {
  res.render("login", { user: req.user });
};

//Logs in user
exports.loginUser = async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render("login", { errors: [{ msg: info.message }] }); // Pass error message
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  })(req, res, next);
};

//Adds new message
exports.addMessage = [
  validateMessage,
  async (req, res) => {
    if (!req.user) return res.redirect("/login");
    const { title, message } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res
        .status(404)
        .render("addMessage", { user: req.user, errors: errors.array() });

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
  },
];

//Deletes messge
exports.deleteMessage = async (req, res) => {
  if (!req.user || req.user.is_admin !== "true")
    return res.status(404).redirect("/");

  const { id } = req.params;

  await db.removeMessage(id);
  res.redirect("/");
};

//Renders join club page
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
    status:
      "Join the Club by entering the secret code below (you might want to see the README file of this repo)",
  });
};

//Updates user as a member
exports.joinMembership = async (req, res) => {
  if (!req.user) return res.status(404).redirect("/login");

  if (
    req.user &&
    (req.user.is_admin === "true" || req.user.is_member === "true")
  ) {
    return res.status(404).redirect("/");
  }
  if (req.body.clubSecret !== process.env.CLUB_SECRET_KEY)
    return res.status(404).render("memberJoin", {
      status:
        "Incorrect code (you might want to see the README file of this repo)",
      user: req.user,
    });

  await db.addUserToClub(req.user.id, req.user.username);
  res.render("/member-join", { user: req.user, status: "Welcome to the club" });
};
