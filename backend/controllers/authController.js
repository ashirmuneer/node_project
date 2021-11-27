const User = require('../models/User');

const ErrorHandler  = require('../utils/ErrorHandler');
const catchAsyncError = require('../middlewares/catchAsyncError');
const sendToken = require('../utils/JwtToken');


//Register user =>  /api/v1/register

exports.registerUser =  catchAsyncError( async (req, res, next) => {

    const { name, email, password } = req.body;

    const user =  await User.create({
        name,
        email,
        password,
        avatar:{
            public_id: 'products/dsvbpny402gelwugv2le',
            url: 'https://res.cloudinary.com/bookit/image/upload/v1608062030/products/dsvbpny402gelwugv2le.jpg'
        }
    })

    sendToken(user,200,res);

    // const token = user.getJwtToken(); 

    // res.status(201).json({
    //     success: true,
    //     user,
    //     token
    // })
})


//Login User => /api/v1/login

exports.loginUser = catchAsyncError( async (req,res,next) => {

  const { email,password } = req.body;

    if(!email || !password) {
        return next(new ErrorHandler('Please enter email and password',400))
    }
   
    // finding user in database
    const user = await User.findOne({ email }).select('+password')

    if(!user){
        return next(new ErrorHandler('Invalaid Email or Password',401))
    }

    //check password is correct or not
    const ispasswordmatched  = await user.comparePassword(password);

    if(!ispasswordmatched) {
        return next(new ErrorHandler('Invalaid Email or Password',401))
    }

    sendToken(user,200,res);

    // const token = user.getJwtToken();

    // res.status(200).json({
    //     success: true,
    //     token
    // })

})



// Logout user => /api/v1/logout

exports.logout = catchAsyncError( async(req, res, next) => {
    res.cookie('token',null,{
        expires: new Date(Date.now()),
        httpOnly:true
    })

    res.status(200).json({
        success:true,
        message: "Logged Out"
    })

});