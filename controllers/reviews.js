const CampGround = require("../models/campground")
const Review = require("../models/review")


module.exports.createReview = async(req, res) => {
    // res.send("You made it!!")
    const campground = await CampGround.findById(req.params.id)
    const review = new Review(req.body.review);
    review.author = req.user._id

    campground.reviews.push(review);
    await review.save();
    await campground.save();

    req.flash("success", "Review Added")
    res.redirect(`/campgrounds/${campground._id}`);

}

module.exports.destroyReview = async(req, res) => {
    // res.send("Delete Me!!")
    const { id, reviewId } = req.params
    await CampGround.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review has been deleted!")
    res.redirect(`/campgrounds/${id}`);
}