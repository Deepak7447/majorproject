const express = require("express");
const router=express.Router();


//index routes
router.get("/",(req,res)=>{
    res.send("All users");
})

//show route
router.get("/:id",(req,res)=>{
    let {id}=req.params;
    res.send(`Showing details of user with id ${id}`);
})

//post route
router.post("/",(req,res)=>{
    res.send("Creating a new user");
})

//delete route
router.delete("/:id",(req,res)=>{
    let {id}=req.params;
    res.send(`Deleting user with id ${id}`);    
})

module.exports=router;
