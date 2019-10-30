const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
    const body = request.body
    //console.log('loginRouter request body.password: ', body.password)

    const user = await User.findOne({ username: body.username })
    //console.log('juuseri tietokannassa: ', user)
    //console.log('juuserin passu joka haluaa lisätä blogin: ', body.password)
    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(body.password, user.passwordHash)

    //console.log('passwordCorrect: ', passwordCorrect)
    if(!(user && passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password'
        })
    }

    const userForToken = {
        username: user.username,
        id: user._id,
    }
    //console.log('userForToken: ', userForToken)
    const token = jwt.sign(userForToken, process.env.SECRET)

    //console.log('token: ', token)

    response
        .status(200)
        .send({ token, username: user.username, name: user.name})
})

module.exports = loginRouter