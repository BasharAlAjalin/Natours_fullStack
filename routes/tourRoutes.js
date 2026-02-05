const express = require("express");
const tourController = require("./../controllers/tourController");

const router = express.Router();

router.route("/tours-stats").get(tourController.getTourStats);
router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);
router
  .route("/")
  .post(tourController.createTour)
  .get(tourController.getAllTours);
router
  .route("/:id")
  .get(tourController.getTourById)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
