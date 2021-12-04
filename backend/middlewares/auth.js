const User = require('../models/User');
const catchAsyncError = require("./catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const jwt  = require('jsonwebtoken');

// checks if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncError( async (req,res,next)=>{

    const { token } = req.cookies

    // console.log(token);

    if(!token){
        return next(new ErrorHandler("Login first to access this resource",401));
    }

    const decode = jwt.verify(token,process.env.JWT_SECRET);
    req.user = await User.findById(decode.id)

    next();

})

// handling  users roles
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            console.log(req.user.id);
            return next(new ErrorHandler(`Roles (${req.user.role}) is not allowed to access this resource`,403)) 
        }

        next();
    }
}