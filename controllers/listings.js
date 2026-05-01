const Listing = require("../models/listing.js"); // for creating listings
const mongoose = require("mongoose"); // for checking if listing id is valid

// index route
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
};

// new form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// show route
module.exports.showListing = async (req, res) => {
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
};

// create route
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

// edit form
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
   let originalImageURL = listing.image.url;
   originalImageURL = originalImageURL.replace("/upload", "/upload/h_300,w_300"); // Resize image to width of 300px for the edit form

    res.render("listings/edit.ejs", { listing, originalImageURL });
};

// update route
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(
        id,
        req.body.listing,
        { runValidators: true, new: true }
    );

    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;

        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

// delete route
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
};