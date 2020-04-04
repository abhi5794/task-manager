const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

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
        unique: true,
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
    }],
    avatar:{
        type: Buffer
    }
}, {
    timestamps:true // enable timestamps
})

//setting up virtual relationship between Task and User
userSchema.virtual('tasks',{
    ref:'Task',
    localField: '_id', //mapping relationship
    foreignField: 'owner'
})

//hide private data, JSON.stringify is called every time res.send() is called,
//which in turn calls .toJSON so giving us the option to customize the output
userSchema.methods.toJSON = function(){
    const userObject = this.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

//instance method because we are acting on the instance and not on the class
userSchema.methods.generateAuthToken = async function(){
    const token = jwt.sign({_id: this._id.toString() }, process.env.JWT_SECRET)

    this.tokens = this.tokens.concat({ token })
    await this.save()

    return token
}

//Class methods is being used as this is involved
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

//Middleware
//hash the plaintext password before saving
userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 8)
    }

    next() //needs to be specified for the save to occur, it is an event

})

//delete tasks when user is deleted
userSchema.pre('remove', async function(next){
    await Task.deleteMany({owner: this._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User