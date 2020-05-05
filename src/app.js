//This is setup to be used by SuperTest, module for testing express apis, so we need everything from index.js
//except for port and listen
//this is for test (not for dev and prod)

const express = require('express')
require('./db/mongoose')

// const Task = require('./models/task')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()

app.use(express.json()) // it will parse the incoming body data to json
app.use(userRouter)
app.use(taskRouter)

module.exports = app