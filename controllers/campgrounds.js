const CampGround = require("../models/campground")
const { cloudinary } = require("../cloudinary")

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async(req, res) => {
    const campgrounds = await CampGround.find({})
    res.render("campgrounds/index", { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new")
        // res.send("Add new")
}

module.exports.createCampground = async(req, res, next) => {
    // if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);
    const geoData = await geoCoder.forwardGeocode({
        // query: "Yosemite, CA",
        query: req.body.campground.location,
        limit: 1
    }).send()

    const campground = new CampGround(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;

    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id;
    await campground.save();
    // console.log(campground);

    req.flash("success", "successfully made a new campground")
    res.redirect(`/campgrounds/${campground._id}`)
        // res.send(req.body)
}

module.exports.showCampground = async(req, res) => {
    const campground = await CampGround.findById(req.params.id).populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate("author");
    // console.log(campground)  

    if (!campground) {
        req.flash("error", "Cannot find the requested campground")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", { campground, msg: req.flash("success") })
}

module.exports.renderEditForm = async(req, res) => {
    const { id } = req.params;
    // const campground = await CampGround.findById(id);
    const campground = await CampGround.findById(id);

    if (!campground) {
        req.flash("error", "Cannot find the requested campground")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", { campground })
}

module.exports.updateCampGround = async(req, res) => {
    // res.send("it worked");
    const { id } = req.params;
    // console.log(req.body)

    const campground = await CampGround.findByIdAndUpdate(id, {...req.body.campground })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        console.log(campground)
    }

    req.flash("success", "Successfully upgraded campground")
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.destroyCampGround = async(req, res) => {

    const { id } = req.params
    await CampGround.findByIdAndDelete(id);

    req.flash("success", "Campground deleted!")
    res.redirect("/campgrounds")
}