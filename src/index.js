const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json()) // it will parse the incoming body data to json
app.use(userRouter)
app.use(taskRouter)

app.listen(port, ()=>{
    console.log('Server is up on '+ port)
})

// const jwt = require('jsonwebtoken')
const myFunction = async () =>{
    // const token = jwt.sign({_id:'abcd123'}, 'taskmanagerapp',{expiresIn: '2 seconds'})
    // console.log(token)
    // console.log(jwt.verify(token, 'taskmanagerapp'))
}

myFunction()