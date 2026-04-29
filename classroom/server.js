const express = require("express");
const app=express();

const users=require("./routes/user.js");
const posts=require("./routes/post.js");

app.use("/users",users);
app.use("/posts",posts);


app.listen(3000,()=>{
    console.log("Serving on port 3000");
})

app.get("/",(req,res)=>{
    res.send("Hello World");    
})



