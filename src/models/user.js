const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name:{
        type: String,
        unique: true,
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
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})

//method because we are acting on the instance and not on the class
userSchema.methods.generateAuthToken = async function(){
    const token = jwt.sign({_id: this._id.toString() }, 'thisis')

    this.tokens = this.tokens.concat({ token })
    await this.save()

    return token
}

//function is being used as this is involved
userSchema.statics.findByCredentials = async function (email, password){
    const user = await this.findOne({ email })

    if(!user){
        throw new Error('Unable to log in')
    }
    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to log in')
    }

    return user
}

//hash the plaintext password before saving
userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 8)
    }

    next() //needs to be specified for the save to occur, it is an event

})

const User = mongoose.model('User', userSchema)

module.exports = User