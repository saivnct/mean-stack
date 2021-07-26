//npm install --save express
//npm install --save-dev nodemon
//npm install --save body-parser
//npm install --save mongoose
//npm install --save mongoose-unique-validator
//npm install --save multer
//npm install --save bcryptjs
//npm install --save jsonwebtoken

//web socket tut https://www.udemy.com/course/angular-2-and-nodejs-the-practical-guide/learn/lecture/10523172#questions/11161631/


const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const postsRouter = require("./routes/posts");
const userRouter = require("./routes/user");

const app = express();

mongoose.connect("mongodb+srv://giangbb:"+process.env.MONGO_ATLAS_PW+"@cluster0.ia28f.mongodb.net/mean-course?retryWrites=true")
.then(() => {
  console.log('Connected to database');
}).catch(() => {
  console.log('Connection to database failed')
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/images",express.static(path.join("images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/posts",postsRouter)
app.use("/api/user",userRouter)



module.exports = app;
