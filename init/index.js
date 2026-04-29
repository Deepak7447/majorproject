const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});

    const updatedData = initData.data.map((obj) => ({
        ...obj,
        owner: new mongoose.Types.ObjectId("69ee73d0037224fdebda3656")
    }));

    await Listing.insertMany(updatedData);

    console.log("Database Initialized");
};

initDB();