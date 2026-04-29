const { model } = require("mongoose");

module.exports.destroyReview= async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}



module.exports.createReview=async (req, res) => {
   let listing = await Listing.findById(req.params.id);
   if (!listing) {
   throw new ExpressError("Listing not found", 404);
}
   let newreview = new Review(req.body.review);
   listing.reviews.push(newreview);
   await newreview.save();
   await listing.save();
   res.redirect(`/listings/${listing._id}`);
}