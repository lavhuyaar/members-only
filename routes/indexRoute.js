const { Router } = require("express");
const {
  getMessages,
  createUser,
  logoutUser,
  renderAddMessage,
  addMessage,
  deleteMessage,
  renderJoinPage,
  joinMembership,
  renderLoginPage,
  renderSignUp,
  loginUser
} = require("../controllers/indexController");
const passport = require("passport");

const indexRoute = Router();

indexRoute.get("/", getMessages);
indexRoute.get("/sign-up", renderSignUp);
indexRoute.post("/sign-up", createUser);
indexRoute.get("/login", renderLoginPage);
indexRoute.post("/login", loginUser);
indexRoute.get("/logout", logoutUser);
indexRoute.get("/add-message", renderAddMessage);
indexRoute.post("/add-message", addMessage);
indexRoute.get("/:id/delete", deleteMessage);
indexRoute.get("/member-join", renderJoinPage);
indexRoute.post("/member-join", joinMembership);

module.exports = indexRoute;
