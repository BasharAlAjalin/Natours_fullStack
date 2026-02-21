const express = require("express");
const reviewController = require("./../controllers/reviewController");
const authController = require("./../controllers/authController");
const reviewRouter = express.Router({ mergeParams: true });
reviewRouter.use(authController.protect);
reviewRouter
  .route("/")
  .get(reviewController.getTourId, reviewController.getAllReviews)
  .post(
    authController.restrictTo("user"),
    reviewController.setTourAndUserIds,
    reviewController.createNewReview,
  );

reviewRouter
  .route("/:id")
  .get(reviewController.getReviewById)
  .patch(
    authController.restrictTo("user", "admin"),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo("user", "admin"),
    reviewController.deleteReveiw,
  );

module.exports = reviewRouter;
