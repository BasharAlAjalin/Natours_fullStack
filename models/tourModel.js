const mongoose = require("mongoose");
const slugyfi = require("slugyfi");
const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, " Tour must have a name"],
      unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "Durations must be declared"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A size must be declared"],
    },
    difficulty: {
      type: String,
      required: [true, " The difficultly must be declared"],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, " Tour must have a price"],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, " Summary must be declared"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, " cover image must be declared"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
toursSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

toursSchema.pre("save", function (next) {
  this.slug = slugyfi(this.name, { lower: true });
  next();
});

toursSchema.post("save", function (doc, next) {
  console.log(doc);
  next();
});
const Tour = mongoose.model("Tour", toursSchema);
module.exports = Tour;
