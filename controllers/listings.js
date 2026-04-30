const Listing = require("../models/listing.js");//for creating listings
const mongoose = require("mongoose");//for checking if listing id is valid
//for handling listing routes
module.exports.index= async(req,res)=>{

    
const allListings = await Listing.find({});
res.render ("listings/index", {allListings});

}

//for handling listing routes
module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
}

//for handling listing routes
module.exports.showListing=async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid Listing ID");
        return res.redirect("/listings");
    }

   const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    })
    .populate("owner");

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
}

//for creating listings
module.exports.createListing = async (req, res) => {
    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;

    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await newListing.save();

    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listings");
};



module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}

module.exports.updateListing=async(req,res)=>{
    let {id}=req.params;

    await Listing.findByIdAndUpdate(id,req.body.listing,{runValidators:true,new:true});

    req.flash("success","Listing updated successfully!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success","Listing deleted successfully!");
    res.redirect("/listings");
}