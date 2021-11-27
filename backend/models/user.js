const moongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const userSchema = new moongoose.Schema({

    name: {
        type: String,
        required: [true, 'Please enter your name'],
        maxLength: [30, 'Your name cannot exceed 30 characters']
    },
    email :{
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        validate: [validator.isEmail,'Please enter a valid email']
    },
    password :{
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [6, 'Your password must be at least 6 characters'],
        select: false
    },
    avatar:{
        public_id : {
            type: String,
            required:true
        },
        url:{
            type: String,
            required:true
        }

    },
    role:{
        type: String,
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date

})

//Encrypt password before saving
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) {
        next()
    }

    this.password = await bcrypt.hash(this.password,10)
})

//return JWT Token
userSchema.methods.getJwtToken = function(){
    return jwt.sign({ id: this._id},process.env.JWT_SECRET,{
          expiresIn: process.env.JWT_EXPIRES_TIME
    });
}


//compare user password
userSchema.methods.comparePassword = async function(enterdpassword){

        return  await bcrypt.compare(enterdpassword,this.password)
}


module.exports = moongoose.model('User',userSchema);