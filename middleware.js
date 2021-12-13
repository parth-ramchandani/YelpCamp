const { campgroundSchema, reviewSchema } = require("./schemas")
const ExpressError = require("./utils/ExpressError")
const CampGround = require("./models/campground")
const Review = require("./models/review")


module.exports.isLoggedIn = (req, res, next) => {
    // console.log("REQ.USER...", req.user)

    if (!req.isAuthenticated()) {
        // console.log(req.path, req.originalUrl)
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be signed in first!")
        return res.redirect("/login")
    } else {
        next();
    }
}

module.exports.validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
    // console.log(result)
}

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campground = await CampGround.findById(id);
    if (!campground.author.equals(req.user.id)) {
        req.flash("error", "You don't have access to do that");
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}
module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user.id)) {
        req.flash("error", "You don't have access to do that");
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        // console.log(error)
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}