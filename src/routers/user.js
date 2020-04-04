const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')

//get your user profile
router.get('/users/me',auth,  async (req,res)=>{ //passing auth as second arg for middleware
    res.send(req.user)
},(error, req, res, next)=>{
    res.status(400).send({error:error})
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
},(error, req, res, next)=>{
    res.status(400).send({error:error})
})

//login
router.post('/users/login', async (req,res) => {
    try{
        console.log(req.body.email, req.body.password)
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken() //it is on a specific user and so User is not used
        res.send({user, token}) //this is accessible using req.user & req.token
    }catch (e){
        res.status(400).send()
    }
},(error, req, res, next)=>{
    res.status(400).send({error:error})
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
},(error, req, res, next)=>{
    res.status(400).send({error:error})
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
},(error, req, res, next)=>{
    res.status(400).send({error:error})
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
},(error, req, res, next)=>{
    res.status(400).send({error:error})
})

router.delete('/users/me',auth , async (req, res)=>{
    try{
        await req.user.remove()
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
},(error, req, res, next)=>{
    res.status(400).send({error:error})
})

const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image'))
        }
        cb(undefined,true)
    }
})


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res)=>{ //avatar is the key that needs to be passed in the POST form request
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error, req, res, next)=>{
    res.status(400).send({error:error})
})

router.delete('/users/me/avatar', auth , async (req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
},(error, req, res, next)=>{
    res.status(400).send({error:error})
})

router.get('/users/:id/avatar', async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})

module.exports = router