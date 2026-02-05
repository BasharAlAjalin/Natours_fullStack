const mongoose = require("mongoose");
const slugify = require("slugify");
const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, " Tour must have a name"],
      unique: true,
      trim: true,
    },
    slug: String,
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
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "The difficulty must be either: easy , medium , difficult",
      },
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
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: " The discount must be less than the original price",
      },
    },
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
    secretTour: {
      type: Boolean,
      default: false,
    },
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
  this.slug = slugify(this.name, { lower: true });
  next();
});

toursSchema.post("save", function (doc, next) {
  console.log(doc);
  next();
});

toursSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

toursSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
const Tour = mongoose.model("Tour", toursSchema);
module.exports = Tour;
