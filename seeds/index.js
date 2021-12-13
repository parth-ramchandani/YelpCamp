const mongoose = require("mongoose");
const CampGround = require("../models/campground")
const cities = require("./cities")
const { places, descriptors } = require("./seedHelpers")

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Mongo Connection Open!")
    })
    .catch(err => {
        console.log("Oh no Mongo connection Error", err)
    })

const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async() => {
    await CampGround.deleteMany({});
    // const c = new CampGround({ title: "purple field" });
    // await c.save();

    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new CampGround({
            author: "61b1bb5953a40998af46cce5",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [{
                    url: 'https://res.cloudinary.com/pheonix2259/image/upload/v1639132781/YelpCamp/bvewj4k6upzd0j6pq2c0.jpg',
                    filename: 'YelpCamp/bvewj4k6upzd0j6pq2c0',
                },
                {
                    url: 'https://res.cloudinary.com/pheonix2259/image/upload/v1639132781/YelpCamp/btdevq1ktafx6g5bjjtk.jpg',
                    filename: 'YelpCamp/btdevq1ktafx6g5bjjtk',
                },
                {
                    url: 'https://res.cloudinary.com/pheonix2259/image/upload/v1639132781/YelpCamp/v9djfbhhepqdvtxe5qyq.jpg',
                    filename: 'YelpCamp/v9djfbhhepqdvtxe5qyq',
                }
            ],
            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facilis asperiores rerum incidunt impedit illum, a corrupti! Esse numquam quaerat consequuntur cupiditate voluptatem ex doloribus, neque rem voluptate, accusantium est officia?",
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            }
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})