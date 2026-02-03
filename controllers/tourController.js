const Tour = require("./../models/tourModel");

// exports.getAllTours = (req, res) => {
//   res.status(200).json({
//     status: "success",
//     // results: tours.length,
//     // data: {
//     //   tours,
//     // },
//   });
// };

// exports.getTourById = (req, res) => {
//   const id = Number(req.params.id);
//   const tour = tours.find((tour) => tour.id === id);
//   res.stats(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   });
// };
exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      status: "fail",
      message: "En error occured 👎",
    });
  }
};
