const User = require('../models/User');

const ErrorHandler  = require('../utils/ErrorHandler');
const catchAsyncError = require('../middlewares/catchAsyncError');
const sendToken = require('../utils/JwtToken');
const  sendEmail  = require('../utils/sendEmail');
const crypto = require('crypto');

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


//Forgot password  => /api/v1/password/forgot

exports.forgotPassword = catchAsyncError(async (req, res, next) =>{

      const user = await User.findOne({email:req.body.email });

      if(!user){
          return next(new ErrorHandler('User not found with this email',404))
      }

      //Get reset token
      const resetToken  = user.getResetPasswordToken();

      await user.save({ validateBeforeSave:false})

      const resetUrl  = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

      const message = `Your password reset token is as follow:\n\n${resetUrl}\n\n If you have not already
        requested this email, then ignore it.`;

        console.log(user.email);

        try{

            await sendEmail({
                email:user.email,
                subject: "ShopIT recover password",
                message
            })

            res.status(200).json({
                success:true,
                message: `Email sent to: ${user.email}`
            })

        } catch(error){
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave:false})

            return next(new ErrorHandler(error.message,500))

        }
})

//Reset Password = => /api/v1/password/reset/:token

exports.resetpassword = catchAsyncError(async (req, res, next) =>{

    //Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({ 
        resetPasswordToken: resetPasswordToken, 
        resetPasswordExpire : { $gt : Date.now()}
    })

    if(!user){
        return next(new ErrorHandler('Password reset token is invalid or has been expired',400))
    }


    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Password and Confirmed Password should be same',400))
    }

  //setup new password
  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user,200,res);  

});


// Get Currently Login user detail => /api/v1/me
exports.getUserProfile = catchAsyncError( async (req, res, next) => {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({ 
        success: true,
        user
     });

});

// update / change password => /api/v1/password/update

exports.updatePassword = catchAsyncError( async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    const isMatched = await user.comparePassword(req.body.oldPassword) 

    if(!isMatched) {
        return next(new ErrorHandler('Old Password is not matched',400));
    }

    user.password = req.body.password
    await user.save();

    sendToken(user,200,res);  

});


//update user profile  => /api/v1/me/update

exports.updateProfile = catchAsyncError( async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    // update avatar to do
    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new :true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        user
    })

});





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


//Admin routes 

//Get all users => /api/v1/admin/users

exports.allUsers = catchAsyncError( async (req, res, next) => {

    const users  = await User.find();

    res.status(200).json({
        success: true,
        users
    })


});


// get specific user detail  => /api/v1/admin/user/:id

exports.getuser = catchAsyncError( async (req, res, next) => {

    const user  = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`user does not found with id ${req.params.id}`,400));
    }

    res.status(200).json({
        success: true,
        user
    })
});

 
//update profile of specific user by id  =  => /api/v1/admin/user/:id

exports.updateUser = catchAsyncError( async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const usercheck  = await User.findById(req.params.id);
    
    if(!usercheck){
        return next(new ErrorHandler(`user does not found with id ${req.params.id}`,400));
    }

    // update avatar to do
    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new :true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        user
    })

});


//delete profile of specific user by id  =  => /api/v1/admin/user/:id

exports.deleteUser = catchAsyncError( async (req, res, next) => {

    const user  = await User.findById(req.params.id);
    
    if(!user){
        return next(new ErrorHandler(`user does not found with id ${req.params.id}`,400));
    }

    await user.remove();
 
    res.status(200).json({
        success: true,    
    })

});

