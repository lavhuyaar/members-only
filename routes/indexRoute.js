const { Router } = require("express");
const { getMessages, createUser, logoutUser, renderAddMessage, addMessage, deleteMessage, renderJoinPage, joinMembership } = require("../controllers/indexController");
const passport = require("passport");

const indexRoute = Router();

indexRoute.get("/", getMessages);
indexRoute.get("/sign-up", (req, res) => res.render("sign-up"));
indexRoute.post("/sign-up", createUser);
indexRoute.get("/login", (req, res) => res.render("login", { user: req.user }));
indexRoute.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);
indexRoute.get('/logout', logoutUser);
indexRoute.get('/add-message', renderAddMessage);
indexRoute.post('/add-message', addMessage);
indexRoute.get('/:id/delete', deleteMessage);
indexRoute.get('/member-join', renderJoinPage);
indexRoute.post('/member-join', joinMembership);

module.exports = indexRoute;
