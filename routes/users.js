const express = require("express");
const router = express.Router();
// const authMiddleware = require("../middleware/authentication");
// router.use(authMiddleware);
const User = require("../models/user-module");

const getUsers = async (req, res) => {
  console.log("getUsers: ");
  const users = await User.find();
  // const users = JSON.parse(fs.readFileSync("./users.json", "utf8"));
  res.send(users); // kill call
};
router.get("/", getUsers);

router.get("/users/:userId", function (req, res) {
  const userId = +req.params.userId;
  const users = JSON.parse(fs.readFileSync("./users.json", "utf8"));
  const user = users.find((user) => user.id === userId);
  res.send(user);
});

router.get("/users/:userId/balance", (req, res) => {
  const userId = +req.params.userId;
  const users = JSON.parse(fs.readFileSync("./users.json", "utf8"));
  const user = users.find((user) => user.id === userId);
  res.send(`${user.balance}`);
  // db.find("user")
});

router.post("/", async (req, res, next) => {
  // const newUser = req.body;
  // users.push(newUser);
  // const users = JSON.parse(fs.readFileSync("./users.json", "utf8"));
  // users.push(newUser);
  // fs.writeFileSync("./users.json", JSON.stringify({}));
  try {
    //
    const user = new User(req.body);
    await user.save(); // request mongo  - 1
    res.send("Success"); // 2
  } catch (error) {
    next(error);
  }
  // 1+1 - sync operation
  // get/fetch data from server  - async operation
});

router.patch("/age/:name", async (req, res) => {
  try {
    await User.findOneAndUpdate(
      { name: req.params.name },
      { age: req.body.age }
    );
    res.send("Success");
  } catch (error) {
    console.log(error);
  }
});

router.patch("/users/:userId/balance", (req, res) => {
  const userId = +req.params.userId;
  const users = JSON.parse(fs.readFileSync("./users.json", "utf8"));
  const user = users.find((user) => user.id === userId);
  const { balance } = req.body;
  user.balance = balance;
  fs.writeFileSync("./users.json", JSON.stringify(users));
  res.send("Success");
});

router.delete("/users/:userId", (req, res) => {
  const userId = +req.params.userId;
  const users = JSON.parse(fs.readFileSync("./users.json", "utf8"));
  const userIndex = users.findIndex((user) => user.id === userId);
  users.splice(userIndex, 1);
  fs.writeFileSync("./users.json", JSON.stringify(users));
  res.send("Success");
});

module.exports = router;
