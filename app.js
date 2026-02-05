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
  const error = new Error(
    `Couldn't find  the ${req.originalUrl} on the server 👎`,
  );
  error.status = "fail";
  error.statusCode = 404;
  next(error);
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});
module.exports = app;
