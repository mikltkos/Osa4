const lodash = require('lodash')
const Blog = require('../models/blog')
const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const initialBlogs = [
    {
        title: 'React patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7
    },
    {
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5
    },
    {
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
        likes: 12
    },
    {
        title: 'First class tests',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
        likes: 10
    },
    {
        title: 'TDD harms architecture',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
        likes: 0
    },
    {
        title: 'Type wars',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
        likes: 2  
    }  
]

const initialUsers = [
    {
        username: 'testaaja',
        name: 'Teppo Testaaja',
        password: 'tsalasana'
    },
    {
        username: 'root',
        name: 'Rootti Käyttäjä',
        password: 'rsalasana'
    },
    {
        username: 'mikki',
        name: 'Mika Koski',
        password: 'msalasana'
    }
]

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
        
}

const addBlog = async (username, password, blog) => {
    const user = {
        username: username,
        password: password,
    }

    const authorization = await api
        .post('/api/login')
        .send(user)

    const token = authorization.body.token
    
    
    await api
        .post('/api/blogs')
        .set({'Authorization': `bearer ${token}`})
        .send(initialBlogs[blog])
}

// eslint-disable-next-line no-empty-pattern
const dummy = ([]) => {
    return 1
}

const totalLikes = blogs => {
    const reducer = (summ, item) => {
        return summ + item.likes
    }    
    return blogs.reduce(reducer, 0)    
}

const favoriteBlog = blogs => {
    const result = blogs.reduce((max, blog) => blog.likes > max ? blog.likes : max, blogs[0].likes)
    const favBlog = blogs.filter(blog => blog.likes === result)
    //console.log('favBlog: ', favBlog)
    //console.log('favoriteBlog: ', {title: favBlog[0].title, author: favBlog[0].author, likes: favBlog[0].likes})
    return {title: favBlog[0].title, author: favBlog[0].author, likes: favBlog[0].likes}
}

const mostBlogs = blogs => {
    const result = lodash.countBy(blogs, 'author')
    const values = Object.values(result)
    const resultArray = Object.entries(result)
    const max = Math.max(...values)
    const most = resultArray.filter(x => x[1] === max)
    return {'author': most[0][0].toString(), 'blogs': most[0][1]}
}

const mostLikes = blogs => {
    const result = lodash.countBy(blogs, 'author')
    const keys = Object.keys(result)
    let authorsAndLikes = new Array()
    for(let i = 0; i < keys.length; i++){
        let authAndLikes = {'author': keys[i], 'likes': 0}
        for(let j = 0; j < blogs.length; j++){
            if(blogs[j].author === keys[i]){
                authAndLikes.likes += blogs[j].likes
            }
        }
        authorsAndLikes.push(authAndLikes)
    }

    const maxLikes = authorsAndLikes.reduce((max, blog) => blog.likes > max ? blog.likes : max, authorsAndLikes[0].likes)
    const res = authorsAndLikes.filter(blog => blog.likes === maxLikes)
    return res[0]
}



module.exports = {
    initialBlogs,
    initialUsers,
    blogsInDb,
    usersInDb,
    addBlog,
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes,
}