//create and send token to save in cookie.
const sendToken = (user,statusCode, res)=>{

 //create Jwt token
 const token = user.getJwtToken();

 const options = {
     expires: new Date(
         Date.now() + process.allowedNodeEnvironmentFlags.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
     ),
     httpOnly: true

 }
 res.status(statusCode).cookie('token',token,options).json({
     success: true,
     token,
     user
 })

}

module.exports = sendToken;