const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'thisis')
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})//make sure the token is still in the db

        if(!user){
            throw new Error()//to hand the control to the catch block
        }

        req.user = user //passing the user to route handlers so that they don't have to fin the user again
        next()//allows the route handler to run

    }catch(e){
        res.status(401).send({error: 'please authenticate'})
    }
}

module.exports = auth