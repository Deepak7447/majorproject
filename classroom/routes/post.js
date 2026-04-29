//posts
const express = require("express");
const router=express.Router();

router.get("/",(req,res)=>{
    res.send("All posts");
});


router.get("/:id",(req,res)=>{
    let {id}=req.params;
    res.send(`Showing details of post with id ${id}`);
})  

router.post("/",(req,res)=>{
    res.send("Creating a new post");
});

router.delete("/:id",(req,res)=>{
    let {id}=req.params;
    res.send(`Deleting post with id ${id}`);
})

module.exports=router;
