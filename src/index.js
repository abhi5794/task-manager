//this is for dev and prod
const app = require('./app')

const port = process.env.PORT

app.listen(port, ()=>{
    console.log('Server is up on '+ port)
})