const express = require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync");//for handling errors in async functions
const ExpressError=require("../utils/ExpressError.js");//for handling errors in async functions
const { listingSchema,reviewSchema } = require("../schema.js");//for validating listing data using Joi
const Listing=require("../models/listing.js");//for creating listings
const Review = require("../models/review.js");//for creating reviews for listings
const { isLoggedIn, isOwner } = require("../middleware.js");//for checking if user is logged in before allowing them to create, edit or delete listings
const mongoose = require("mongoose");
const listingController = require("../controllers/listings.js");//for handling listing routes

const validateListing = (req, res, next) => {
   const { error } = listingSchema.validate(req.body);

   if (error) {
      let errorMessage = error.details.map(el => el.message).join(", ");
      throw new ExpressError(errorMessage, 400);
   }

   next();
};

const validateReview = (req, res, next) => {
   const { error } = reviewSchema.validate(req.body);

   if (error) {
      let errorMessage = error.details.map(el => el.message).join(", ");
      throw new ExpressError(errorMessage, 400);
   }

   next();
};

//index routes
router.get("/",wrapAsync(listingController.index));

//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);

//show route
router.get("/:id", wrapAsync(listingController.showListing));

//create route with improved error handling and validation
router.post("/", validateListing, isLoggedIn, wrapAsync(listingController.createListing));

//edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

//update route
router.put("/:id",validateListing, isLoggedIn, isOwner, wrapAsync(listingController.updateListing));

//delete route
router.delete("/:id",isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));


//create review
router.post("/:id/reviews", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "Review added!");
    res.redirect(`/listings/${listing._id}`);
}
));



//delete review
router.delete("/:id/reviews/:reviewId", isLoggedIn, wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
}));

//avg rating route
router.get("/:id/avgRating",wrapAsync(async(req,res)=>{
    let {id}=req.params;    
    let listing = await Listing.findById(id).populate("reviews");
    let reviews = listing.reviews;
    let avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    res.send(`Average rating for ${listing.title} is ${avgRating}`);
}));

module.exports=router;