const express = require("express");
const router = express.Router();
const fs = require("fs");
const hbs = require("handlebars");

router.get("/", function (req, res) {
  const username = req.headers.username;
  const html = fs.readFileSync("./index.html", "utf8");
  const template = hbs.compile(html);

  res.send(template({ user: username }));
});

module.exports = router;
