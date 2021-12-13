const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync")
const ExpressError = require("../utils/ExpressError");

const CampGround = require("../models/campground")
const Review = require("../models/review")

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const { createReview } = require("../controllers/reviews");

const reviews = require("../controllers/reviews")



router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.destroyReview))

module.exports = router;