const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.userCreate = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });

    return user.save()
  }).then(result => {
    res.status(200).json({
      message: 'User created successfully',
      user: result
    });
  }).catch(err => {
    res.status(500).json({
      message: 'Cannot create new user'
    })
  });
};

exports.userLogin = async (req,res,next) => {
  console.log("call login");

  try{
    let loginUser = await User.findOne({ email: req.body.email });
    if (!loginUser) {
      console.log("call login - not found user");
      return res.status(401).json({
        message: 'Auth failed - not found user'
      });
    }


    // console.log(loginUser,req.body.password, user.password);
    result = await bcrypt.compare(req.body.password, loginUser.password);

    if (!result){
      console.log("call login - wrong pass");
      return res.status(401).json({
        message: 'Auth failed - wrong pass'
      });
    }

    const token = jwt.sign(
      {
        email: loginUser.email,
        userId: loginUser._id
      },
      process.env.JWT_KEY,
      {expiresIn: "1h"}
      );

    res.status(200).json({
        message: 'Auth success',
        token: token,
        expiresIn: 3600,
        userId: loginUser._id
      });
  }catch (err){
    console.log(err);
    return res.status(401).json({
      message: 'Auth failed'
    });
  }

}
