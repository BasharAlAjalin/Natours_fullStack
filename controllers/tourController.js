const AppError = require("../utils/appError");
const Tour = require("./../models/tourModel");
const APIFeatures = require("./../utils/apiFeatures");
const catchAsync = require("./../utils/catchAsync");
exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .fields()
    .pagination();

  const tours = await features.query;
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTourById = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new AppError("no tour found with this ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!newTour) {
    return next(new AppError("no tour found with this ID", 404));
  }
  res.status(201).json({
    status: "success",
    data: {
      newTour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError("no tour found with this ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const Stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: "$difficulty",
        numTours: { $sum: 1 },
        numRating: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    { $sort: { avgPrice: 1 } },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      Stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = Number(req.params.year);
  const plan = await Tour.aggregate([
    { $unwind: "$startDates" },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numOfTours: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numOfTours: -1 },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      plan,
    },
  });
});
