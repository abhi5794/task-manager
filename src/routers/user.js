const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')

//get your user profile
router.get('/users/me',auth,  async (req,res)=>{ //passing auth as second arg for middleware
    res.send(req.user)
})

//create users
router.post('/users',async (req,res)=>{
    const user = User(req.body)
    
    try{
        await user.save()
        const token = await user.generateAuthToken()

        res.status(201).send({ user, token }) //this is accessible using req.user & req.token
    }catch(e){
        res.status(400).send(e)
    }
})

//login
router.post('/users/login', async (req,res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken() //it is on a specific user and so User is not used
        res.send({user, token}) //this is accessible using req.user & req.token
    }catch (e){
        res.status(400).send()
    }
})

//logout
router.post('/users/logout', auth, async (req,res)=>{
    try{
        //req.user and req.token and being sent back from create and login routes
        req.user.tokens = req.user.tokens.filter((token)=>{ //removed the current token
            return token.token !== req.token //return values that are not matching the token
        })
        await req.user.save()

        res.send('Logged out')
    }catch(e){
        res.status(500).send()
    }
})

//logout all
router.post('/users/logoutAll', auth, async (req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send('Logged out of all accounts')
    }catch(e){
        res.status(500).send()
    }
})

router.get('/users/:id',async (req,res)=>{
    const _id = req.params.id

    try{
        const user = await User.findById(_id)
        if(!user){
            return res.status(404).send('Not found')
        }
        res.send(user)
    }catch(e){
        res.status(500).send('Server error')
    }
})

router.patch('/users/:id', async (req,res)=>{
    const updates = Object.keys(req.body)//validating that the allowed fields are being passed 
    const allowedUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid input'})
    }
    try{

        const user = await User.findById(req.params.id)
        updates.forEach((update)=>{
            user[update] = req.body[update]
        })
        await user.save()
        //this bypassed mongoose Schema so we will do it manually
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators: true}) // new: true will return the new user and validation is run
        if(!user){
            return res.status(404).send()
        }
        
        res.send(user)

    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/users/:id', async (req, res)=>{
    try{
        const user = await User.findByIdAndDelete(req.params.id)

        if(!user){
            return res.status(404).send()
        }
        res.send(user)
    }catch(e){
        res.status(500).send()
    }
})


module.exports = router