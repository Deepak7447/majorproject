const mongoose =require("mongoose");
const review = require("./review");
const Schema=mongoose.Schema;

const listingSchema =new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
         filename: String,
         url: String,
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }

});

const Listing =mongoose.model("Listing",listingSchema);

module.exports=Listing;
//this file is used to create a schema for the listing and then export it to be used in other files. It defines the structure of the listing document in the database, including the fields and their types.