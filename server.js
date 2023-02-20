const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
app.use(cors());

app.get("*", (req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");

  next();
});
app.use(express.static("build"));
app.listen(3000, () => {
  console.log("running on port 3000");
});
