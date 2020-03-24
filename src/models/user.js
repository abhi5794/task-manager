const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    password:{
        type: String,
        required: true,
        trim:true,
        minlength: 7,
        validate(value){
            if (value.toLowerCase().includes('password')){
                throw new Error('Password cannot contain password', errors.message)
            }
        }
    },
    email:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }

    },
    age:{
        type: Number,
        default: 0,
        validate(value){
            if (value<0){
                throw new Error('Age must be a positive number')
            }
        }
    }
})

userSchema.pre('save', async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next() //needs to be specified for the save to occur, it is an event

})

const User = mongoose.model('User', userSchema)

module.exports = User