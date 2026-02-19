const Review = require("./../models/reviewModel");
const APIFeatures = require("./../utils/apiFeatures");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Review.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const review = await features.query;
  res.status(200).json({
    status: "success",
    results: review.length,
    data: {
      review,
    },
  });
});

exports.createNewReview = catchAsync(async (req, res, next) => {
  const review = await Review.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      review,
    },
  });
});

exports.getReviewById = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new AppError("This review doesn't exist", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!review) {
    return next(new AppError("No review found with this Id", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});

exports.deleteReveiw = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    return next(new AppError("No review found with this Id", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
