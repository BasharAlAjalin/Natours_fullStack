const express = require("express");
const fs = require("fs");

const app = express();

const tours = JSON.parse(
  fs.readFileSync(
    `${__dirname}/dev-data/data/tours-simple.json`,
    "utf-8",
    (err, data) => {},
  ),
);  
app.get("/api/v1/tours", (req, res) => {});
const port = 3000;
app.listen(port, () => {
  console.log(` App is listining to port ${port} `);
});
