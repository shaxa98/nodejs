const multer = require("multer");
const express = require("express");
const fs = require("fs");

const upload = multer();
const router = express.Router();

router.get("*", express.static("img"));
// 0101001 -> Binary/Blob data
// router.use("/avatar", upload.single("avatar"));
router.post("/avatar", upload.single("avatar"), async (req, res) => {
  console.log("req: ", req);
  try {
    fs.writeFileSync(`./img/${req.file.originalname}`, req.file.buffer);
    res.status(201).send("Image uploaded successfully");
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

module.exports = router;
