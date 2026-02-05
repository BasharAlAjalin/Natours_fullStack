const express = require("express");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const app = express();
app.use(express.json());
app.set("query parser", "extended");
app.use(express.static(`${__dirname}/public`));
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.all(/.*/, (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Couldn't find  the ${req.originalUrl} on the server 👎`,
  });
});
module.exports = app;
