const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`),
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/users.json`),
);
const getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTourById = (req, res) => {
  const id = Number(req.params.id);
  const tour = tours.find((tour) => tour.id === id);
  if (!tour) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid Id",
    });
  }

  res.stats(200).json({
    status: "success",
    data: {
      tour,
    },
  });
};
const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: "success",
        data: {
          tour: newTour,
        },
      });
    },
  );
};

const getAllUsers = (req, res) => {
  res.status(200).json({
    status: "success",
    restuls: users.length,
    data: {
      users,
    },
  });
};

const tourRouter = express.Router();
const userRouter = express.Router();
tourRouter.route("/").get(getAllTours).post(createTour);
tourRouter.route("/:id").get(getTourById);
userRouter.route("/").get(getAllUsers).post(createUser);
userRouter.route("/:id").get(getUserById).patch(updateUser).delete(deleteUser);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
const port = 3000;
app.listen(port, () => {
  console.log(` App is listining to port ${port} `);
});
