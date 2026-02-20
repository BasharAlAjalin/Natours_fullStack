const Review = require("./../models/reviewModel");

const factory = require("./handlerFactory");

exports.getTourId = (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  next();
};
exports.getAllReviews = factory.getAll(Review);

exports.setTourAndUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createNewReview = factory.createOne(Review);

exports.getReviewById = factory.getOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReveiw = factory.deleteOne(Review);
