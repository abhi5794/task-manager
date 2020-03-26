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

//update
router.patch('/users/me',auth , async (req,res)=>{
    const updates = Object.keys(req.body)//validating that the allowed fields are being passed 
    const allowedUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid input'})
    }
    try{
        updates.forEach((update)=>{
            req.user[update] = req.body[update]
        })
        await req.user.save()
        res.send(req.user)

    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/users/me',auth , async (req, res)=>{
    try{
        await req.user.remove()
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})


module.exports = router