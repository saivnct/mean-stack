const jwt = require('jsonwebtoken');

module.exports = (req,res,next) => {

  try{
    const token = req.headers.authorization.split(" ")[1]; // "Bearer ashkalsdjkalsda....."
    console.log("token:",token);
    const decodedToken = jwt.verify(token,process.env.JWT_KEY);  //if failed -> throw error
    req.userData = {email: decodedToken.email, userId: decodedToken.userId};
    next();
  }catch(error){
    res.status(401).json({
      message: "You're not authenticated"
    });
  }

}
