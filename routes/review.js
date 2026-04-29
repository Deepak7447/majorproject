const express = require("express");

const wrapAsync=require("../utils/wrapAsync");//for handling errors in async functions
const ExpressError=require("../utils/ExpressError.js");//for handling errors in async functions
const { listingSchema,reviewSchema } = require("../schema.js");//for validating listing data using Joi
const Review=require("../models/review.js");//for creating reviews for listings
const Listing=require("../models/listing.js");//for creating listings
const { isLoggedIn } = require("../middleware.js");
const router = express.Router({ mergeParams: true });
const reviewController=require("../controllers/review.js");//for handling review routes

const validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body);
    let errorMessage = error.details.map((el)=> el.message).join(" ");
    if (error) {
        throw new ExpressError(errorMessage, 400);
    }
    next();
};




//delete review route
router.delete("/:reviewId", isLoggedIn, wrapAsync(reviewController.destroyReview));


//review post route
router.post("/",isLoggedIn, validateReview, wrapAsync(reviewController.createReview));



module.exports=router;