if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

//for loading environment variables from .env file
console.log("SECRET from .env file:", process.env.SECRET); // Debugging line to check if .env is loaded
console.log("process.env.SECRET:", process.env.SECRET); // Debugging line to check if .env is loaded


process.on("uncaughtException", err => {
    console.error("UNCAUGHT:", err);
});

process.on("unhandledRejection", err => {
    console.error("UNHANDLED:", err);
});


const express = require("express");
const app=express();

const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path = require("path");

const methodOverride=require("method-override");//for edit and delete routes
const ejsMate=require("ejs-mate");//for creating boilerplate ejs files for edit and new routes
const wrapAsync=require("./utils/wrapAsync");//for handling errors in async functions
const ExpressError=require("./utils/ExpressError.js");//for handling errors in async functions
const { listingSchema,reviewSchema } = require("./schema.js");//for validating listing data using Joi
const Review=require("./models/review.js");//for creating reviews for listings
const listingRoutes=require("./routes/listing.js");//for handling listing routes
const reviewRoutes=require("./routes/review.js");//for handling review routes
const session=require("express-session");//for handling sessions
const MongoStore=require("connect-mongo");//for storing sessions in MongoDB
const flash=require("connect-flash");//for handling flash messages
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User=require("./models/user.js")



const userRouter=require("./routes/user.js");//for handling user routes
// const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASTDB_URL 
main()
      .then(()=>{
        console.log("Connected to DB");
      })
      .catch((err)=>{
        console.log(err);

      })

async function main(){
    await mongoose.connect(dbUrl);
}
const validateListing = (req, res, next) => {
   const { error } = listingSchema.validate(req.body);

   if (error) {
      let errorMessage = error.details.map(el => el.message).join(", ");
      throw new ExpressError(errorMessage, 400);
   }

   next();
};
// const validateListing = (req, res, next) => {
//    const { error } = listingSchema.validate(req.body);
//    let errorMessage = error.details.map((el)=> el.message).join(" ");
//      if (error) {
//       error.details.forEach(detail => {
//          errorMessage += detail.message + " ";
//       });
//    }

//    if (error) {
//       throw new ExpressError(errorMessage, 400);
//    }

//    next();
// };

app.get("/testListing",wrapAsync(async (req,res)=>{

    let SampleListing=new Listing({
        title: "My new life",
        description:"By the beach",
        price:1200,
        location:"calongute,goa",
        country:"India",
        image:{
            filename:"listingimage",
            url:"https://images.unsplash.com/photo-1501785888041-af3ef285b470"
        }
    });

    await SampleListing.save();

    res.send("Successfull testing");
}));





// const validateListing=(req,res,next)=>{
//    let error=listingSchema.validate(req.body);
   
//    if(error){
//     throw new ExpressError(error.details[0].message,400);
//    }else{
//     next();
//    }
// }
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));//for edit and delete routes
app.engine('ejs',ejsMate);//for creating boilerplate ejs files for edit and new routes
app.use(express.static(path.join(__dirname,"public")));//for serving static files like css and js
app.use("/uploads", express.static(path.join(__dirname, "uploads")));//for serving uploaded images
app.use(express.json()); // for parsing JSON data in request body

const store=MongoStore.create({
    mongoUrl:dbUrl,
    secret:"mysupersecretcode",
    touchAfter:24*60*60
});

store.on("error",function(e){
    console.log("error in mongo store",e);
});

const sessionOptions={
    store:store,
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
};


app.use(session({ ...sessionOptions, store }));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
});


app.use("/listings",listingRoutes);
app.use("/listings/:id/reviews",require("./routes/review.js"));//for handling review routes
app.use("/",userRouter);//for handling user routes

app.get("/", (req,res)=>{
   res.redirect("/listings");
});


// app.get("/testListing",wrapAsync(async (req,res)=>{
//     let SampleListing=new Listing({
//         title: "My new life",
//         description:"By the beach",
//         price:1200,
//         location:"calongute,goa",
//         country:"India",

//     });
//     await SampleListing.save();
//     console.log("sample was saved to DB");
//     res.send("Successfull testing");

// }));




passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/testsession", (req, res) => {
    req.session.count = (req.session.count || 0) + 1;
    res.send(`Session Count: ${req.session.count}`);
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new user({username:"deepak",email:"deepak@example.com"});
//     let registeredUser=await user.register(fakeUser,"password");
//     res.send(registeredUser);
// });
// app.get("/demouser", async (req, res) => {
//     try {
//         let fakeUser = new User({
//             email: "student@gmail.com",
//             username: "delta-student"
//         });

//         let registeredUser = await User.register(fakeUser, "helloworld");

//         res.send(registeredUser);
//     } catch (err) {
//         console.log(err);
//         res.send(err.message);
//     }
// });
// //create route
// app.get("/listings", async (req,res)=>{
//     const allListings = await Listing.find({});

//     res.send(allListings.map(l => l.title).join("<br>"));
// });
// app.post("/listings",wrapAsync(async(req,res,next)=>{
//   //let {title,description,price,location,country}=req.body;  this is destructuring but we can also directly use req.body
  
//     listingSchema.validate(req.body);
//     console.log(result);
//     const { error } = listingSchema.validate(req.body);
// if(error){
//     throw new ExpressError(error.details[0].message,400);
// }
//   const newListing=new Listing(req.body.listing)
//     await newListing.save();
//     res.redirect("/listings");
// }));             





// app.post("/listings", wrapAsync(async (req, res, next) => {

//     const result = listingSchema.validate(req.body);

//     if (result.error) {
//         throw new ExpressError(result.error.details[0].message, 400);
//     }

//     const newListing = new Listing(req.body.listing);
//     await newListing.save();

//     res.redirect("/listings");
// }));




//debug route to check if the data is being saved to the database or not
app.get("/debug", async (req,res)=>{
    const data = await Listing.find({});
    res.send(data);
});

// middleware for handling 404 errors
app.get("/random",(req,res)=>{
    res.send("This is a random route");
});


// ⭐ ONLY ONE 404 middleware
app.use((req,res,next)=>{
    next(new ExpressError("Page Not Found",404));
});


// ⭐ ONLY ONE error middleware
app.use((err,req,res,next)=>{
       console.log("REAL ERROR =>", err);
    let {statusCode=500,message="Something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{message,statusCode});
});
// app.use((req,res)=>{
//     console.log("Hi i am a middleware for handling 404 errors");
//     res.send("Hii im middleware for handling 404 errors. The page you are looking for does not exist.");
// })

// app.get("/random",(req,res)=>{
//     res.send("This is a random route");
// })



app.listen(8080,()=>{
    console.log("Server is listening on port 8080");
});


app.get("/clearusers", async (req,res)=>{
  await User.deleteMany({});
  res.send("users cleared");
});

app.get("/", (req,res)=>{
   res.redirect("/listings");
});