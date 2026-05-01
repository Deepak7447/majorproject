const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },

    description: String,

    image: {
        filename: String,
        url: String,
    },

    price: Number,

    location: String,

    country: String,

    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },

        coordinates: {
            type: [Number],
            default: [73.8567, 18.5204] // Pune default
        }
    },

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;