if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// console.log(process.env.SECRET)

const express = require("express");
const app = express();
const mongoose = require("mongoose")
const path = require("path")
    // const CampGround = require("./models/campground")
const methodOverRide = require("method-override")
const ejsMate = require("ejs-mate")
    // const catchAsync = require("./utils/catchAsync")
    // const expressError = require("./utils/ExpressError");
const ExpressError = require("./utils/ExpressError");
// const Joi = require("joi")
const { campgroundSchema, reviewSchema } = require("./schemas")
    // const Review = require("./models/review")
const session = require("express-session")
const flash = require("connect-flash")
const passport = require("passport");
const LocalStrategy = require("passport-local")
const User = require("./models/user")


const userRoutes = require("./routes/user")
const campgroundsRoutes = require("./routes/campgrounds")
const reviewsRoutes = require("./routes/reviews");

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const { stopCoverage } = require("v8");

const MongoDBStore = require("connect-mongo");

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Mongo Connection Open!")
    })
    .catch(err => {
        console.log("Oh no Mongo connection Error", err)
    })

app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverRide("_method"))
app.use(express.static(path.join(__dirname, "public")))
app.use(mongoSanitize({
    replaceWith: '_',
}));

const secret = process.env.SECRET || "thisshouldbeabettersecret!"

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function(e) {
    console.log("Session Store Error", e)
})

const sessionConfig = {
    store,
    name: "yelpcamp",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/pheonix2259/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // console.log(req.session)
    // console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error")
    next();
})

app.get("/fakeuser", async(req, res) => {
    const user = new User({ email: "parth@gmail.com", username: "parthR" })
    const newUser = await User.register(user, "parth");
    res.send(newUser)
})

app.use("/", userRoutes)
app.use("/campgrounds", campgroundsRoutes)
app.use("/campgrounds/:id/reviews", reviewsRoutes)


app.get("/", (req, res) => {
    // res.send("Hello from yelpcamp")
    res.render("home")
})





// app.get("/makecampground", async(req, res) => {
//     const camp = new CampGround({
//         title: "My Backyard",
//         description: "Cheap Camping"
//     })
//     await camp.save()
//     res.send(camp)
// })

app.all("*", (req, res, next) => {
    // res.send("404!!")
    next(new ExpressError("Page not found", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No! An Error Occurred"
    res.status(statusCode).render("error", { err })
        // res.send("Something went wrong")
})

app.listen(3000, () => {
    console.log("Serving on port 3000")
})