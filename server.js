const express = require("express");
const userRoute = require("./routes/users");
const accountRoute = require("./routes/accounts");
const authMiddleware = require("./middleware/authentication");
const rootRoute = require("./routes/root");
const imageRoute = require("./routes/image");
const healthRoute = require("./routes/health");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(`${process.env.MONGO_URL}/${process.env.MONGO_DATABASE}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((conn) => {
    console.log("MONGO_DB Connected!");
  })
  .catch((err) => {
    console.log("connection to db failed");
    console.log(err.name, err.message);
  });

// Initialize express
const app = express();
// Middleware
// 0101001 -> json
app.use(express.json());
//  0101001 -> form data
app.use(express.urlencoded({ extended: false }));
app.use("/health", healthRoute);
// Auth Router

app.use(authMiddleware);

// Routers
app.use("/user", userRoute);
app.use("/account", accountRoute);
app.use("/image", imageRoute);

app.use("/", rootRoute);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500);
  res.send("Oops, something went wrong.");
});

const port = process.env.PORT || 2500;
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
// ok ok ok ok ok ok OK
