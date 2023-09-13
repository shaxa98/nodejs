const express = require("express");
const router = express.Router();

router.use("/", (req, res, next) => {
  const headerPassword = req.headers.password;
  console.log("headerPassword: ", headerPassword);
  if (headerPassword !== "1234567890") {
    res.status(401).send("Parol xato");
    return;
  }
  console.log("Login success");
  next();
});

module.exports = router;
