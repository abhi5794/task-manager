const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOneId,userOne,setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should sign in a new user', async()=>{
    const response = await request(app).post('/users').send({//store the response to check if user is created in DB
        name:'Abhi',
        email:'form@test.com',
        password:'Red123()()'
    }).expect(201)

    //Assert that the user was created correctly in the DB
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        user:{
            name:'Abhi',
            email:'form@test.com'
        },
        token: user.tokens[0].token
    })
})

test('Should log in existing user', async()=>{
    await request(app).post('/users/login').send({
        email:userOne.email,
        password:userOne.password
    }).expect(200)
})

test('Should not login non exisitin user', async()=>{
    await request(app).post('/users/login').send({
        email:'mail@mail.com',
        password:userOne.password
    }).expect(400)
})

test('Should get profile for user',async()=>{
    await request(app).get('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for non authenticated user',async()=>{
    await request(app).get('/users/me')
    .send()
    .expect(401)
})

test('Should upload avatar image', async()=>{
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar','tests/fixtures/profile-pic.jpg')
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})