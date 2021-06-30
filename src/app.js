require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt = require("bcryptjs");

require("./db/conn");
const Register = require("./models/registers");
const { json } = require("express");
const { log } = require("console");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path)); 
app.set("view engine" , "hbs");  
app.set("views" , template_path);
hbs.registerPartials(partials_path);

// console.log(process.env.SECRET_KEY);

app.get("/" , (req , res) => {
    res.render("index");
});

app.get("/register" , (req , res) => {
    res.render("register");
});

app.get("/login" , (req , res) => {
    res.render("login");
});

// app.post("/register" , async(req , res) => {
//     try {
//         console.log(req.body.firstname);
//         res.send(req.body.firstname);
//     } catch (error) {
//         res.status(400).send(error)
//     }
// }); 

// create a new user in our database
app.post("/register" , async(req , res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if(password===cpassword){
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: password,
                confirmpassword: cpassword 
            })
            
            console.log("the success part" + registerEmployee);
            const token = await registerEmployee.generateAuthToken();
            console.log("the token part"+ token);

            const registered = await registerEmployee.save();
            console.log("the page part" + registered);

            res.status(201).render("index");
        }else{
            res.send("password not matching"); 
        }

    } catch (error) {
        res.status(400).send(error)
        console.log("the error part page");
    }
});

// by Login Fatch Data

app.post("/login" , async(req , res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({email:email});

        const isMatch = await bcrypt.compare(password,useremail.password); 
        const token = await useremail.generateAuthToken();
            console.log("the token part"+ token);

        if (isMatch) {
            res.status(201).render("index");
            } else {
            res.send("invalid password Details");
            }

    } catch (error) {
        res.status(400).send("invalid login Details");
    }
}); 

// jsonwebtoken established
// const jwt = require("jsonwebtoken");
// const createToken = async () => {
//     const token = await jwt.sign({_id: "60d972fd26598417c412acac"},"mynameisshailendrapalandimafreeluncerdeveloperwithfullstack" , {
//         expiresIn:"5 minutes"
//     });

//     console.log(token);

//     const userVer = await jwt.verify(token , "mynameisshailendrapalandimafreeluncerdeveloperwithfullstack" );
//     console.log(userVer);
// }
// createToken();

app.listen(port , () => {
    console.log(`Coonection SuccessFul on ${port}`);
});