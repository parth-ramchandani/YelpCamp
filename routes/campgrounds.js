const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync")
const ExpressError = require("../utils/ExpressError");
const CampGround = require("../models/campground")

const { isLoggedIn, validateCampground, isAuthor } = require("../middleware")

const campgrounds = require("../controllers/campgrounds")

const multer = require("multer");
const { storage } = require("../cloudinary")
const upload = multer({ storage })

router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground))

// router.get("/", catchAsync(campgrounds.index))
// router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

router.get("/new", isLoggedIn, campgrounds.renderNewForm)

router.route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampGround))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.destroyCampGround))

// router.get("/:id", catchAsync(campgrounds.showCampground))
// router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampGround))
// router.delete("/:id", isLoggedIn, isAuthor, catchAsync(campgrounds.destroyCampGround))


router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;