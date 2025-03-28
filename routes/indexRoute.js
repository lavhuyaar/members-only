const { Router } = require("express");
const { getMessages, createUser } = require("../controllers/indexController");

const indexRoute = Router();

indexRoute.get("/", getMessages);
indexRoute.get("/sign-up", (req, res) => res.render("sign-up"));
indexRoute.post("/sign-up", createUser);

module.exports = indexRoute;
