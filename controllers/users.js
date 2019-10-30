

const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')
const logger = require('../utils/logger')

usersRouter.get('/', async (request, response) => {
    const users = await User
        .find({}).populate('blogs', { url: 1, title: 1, author: 1, id: 1 })
    response.json(users.map(u => u.toJSON()))
})

usersRouter.post('/', async (request, response, next) => {

    try{
        const body = request.body
        if(body.password.length < 3 || !body.password){
            logger.error('password not valid')
            response.status(400).send('password not valid').end()
        }else{
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(body.password, saltRounds)
        const user = new User({
            username: body.username,
            name: body.name,
            passwordHash,
        })

        const savedUser = await user.save()
        response.status(200).json(savedUser.toJSON())
        }
    } catch(error) {
        next(error)
    }
})


module.exports = usersRouter
