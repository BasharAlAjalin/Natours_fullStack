const Tour = require("./../models/tourModel");

exports.getAllTours = async (req, res) => {
  try {
    const allTours = await Tour.find();
    res.status(200).json({
      status: "success",
      results: allTours.length,
      data: {
        allTours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "Fail",
      message: "An Error occured 👎",
    });
  }
};

exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.stats(400).json({
      status: "Fail",
      message: "An Erro occured 👎",
    });
  }
};
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
      message: "An error occured 👎",
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const newTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(201).json({
      status: "success",
      data: {
        newTour,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      status: "fail",
      message: "An error occured 👎",
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      status: "fail",
      message: "An error occured 👎",
    });
  }
};
