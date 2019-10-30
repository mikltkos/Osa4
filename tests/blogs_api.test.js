const mongoose = require('mongoose')
const supertest = require('supertest')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('../utils/list_helper.js')
const app = require('../app')

const api = supertest(app)


beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})

    const newUser =  {
        name: 'Tauno Testaaja',
        username: 'testaaja2',
        password: 'tsalasana2'
    }
    
    await api
        .post('/api/users')
        .send(newUser)

    const newUserB = {
        name: 'Teppo Testaaja',
        username: 'testaaja',
        password: 'tsalasana'
    }
    
    await api
        .post('/api/users')
        .send(newUserB)

    await helper.addBlog('testaaja', 'tsalasana', 0)
    await helper.addBlog('testaaja', 'tsalasana', 1)
    await helper.addBlog('testaaja', 'tsalasana', 2)
    await helper.addBlog('testaaja2', 'tsalasana2', 3)
    await helper.addBlog('testaaja2', 'tsalasana2', 4)
    await helper.addBlog('testaaja2', 'tsalasana2', 5)

})

describe('get method tests', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('there are six blogs', async () => {
        let response = await api
            .get('/api/blogs')
        expect(response.body.length).toBe(6)
    })

    test('id is defined', async () => {
        const response = await api
            .get('/api/blogs')

        response.body.map(blog => {
            expect(blog.id).toBeDefined()
        })
    })
})

describe('creating and editing blogs', () => {

    test('a blog can be added ', async () => {
        
        const user = {
            username: 'testaaja',
            password: 'tsalasana',
        }

        const authorization = await api
            .post('/api/login')
            .send(user)

        const token = authorization.body.token


        const newBlog = {
            title: 'test blog',
            author: 'Teppo Testaaja',
            url: 'http://testUrl.com',
            likes: 10,
        
        }
        await api
            .post('/api/blogs')
            .set({'Authorization': `bearer ${token}`})
            .send(newBlog)
            .expect(200)

        const blogsAtEnd = await api
            .get('/api/blogs')    

        expect(blogsAtEnd.body.length).toBe(7)

    })

    test('if no likes, likes must be zero', async () => {

        const user = {
            username: 'testaaja',
            password: 'tsalasana',
        }

        const authorization = await api
            .post('/api/login')
            .send(user)

        const token = authorization.body.token


        const newBlog = {
            title: 'test blog',
            author: 'Test Author',
            url: 'http://testUrl.com'
        }

        await api
            .post('/api/blogs')
            .set({'Authorization': `bearer ${token}`})
            .send(newBlog)

        const blogsAtEnd = await api
            .get('/api/blogs')

        const testBlog = blogsAtEnd.body.filter(blog => blog.title === 'test blog')
        expect(testBlog[0].likes).toBe(0)
    })

    test('are title and url defined', async () => {

        const user = {
            username: 'testaaja',
            password: 'tsalasana',
        }

        const authorization = await api
            .post('/api/login')
            .send(user)

        const token = authorization.body.token

        const newBlog = {
            author: 'Test Author',
            likes: 23
        }

        await api
            .post('/api/blogs')
            .set({'Authorization': `bearer ${token}`})
            .send(newBlog)
            .expect(400)

        const blogsAtEnd = await helper.blogsInDb()
        
        expect(blogsAtEnd.length).toBe(6)    
    })

    test('delete blog item with owner id', async () => {
        
        const blogsAtStart = await api
            .get('/api/blogs')
 
        const user = {
            username: 'testaaja',
            password: 'tsalasana',
        }

        const authorization = await api
            .post('/api/login')
            .send(user)

        const token = authorization.body.token

        const blogToDelete = blogsAtStart.body[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set({'Authorization': `bearer ${token}`})
            .expect(204)

        const blogsAtEnd = await api
            .get('/api/blogs')

        expect(blogsAtEnd.body.length).toBe(5)

        const ids = blogsAtEnd.body.map(blog => blog.ids)

        expect(ids).not.toContain(blogToDelete.id)
    })

    test('deleting blog item with wrong owner id', async () => {
        
        const blogsAtStart = await api
            .get('/api/blogs')
 
        const user = {
            username: 'testaaja2',
            password: 'tsalasana2',
        }

        const authorization = await api
            .post('/api/login')
            .send(user)

        const token = authorization.body.token

        const blogToDelete = blogsAtStart.body[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set({'Authorization': `bearer ${token}`})
            .expect(400)

        const blogsAtEnd = await api
            .get('/api/blogs')

        expect(blogsAtEnd.body.length).toBe(6)

    })

    test('editing likes of blog item', async () => {
        const blogsAtStart = await api
            .get('/api/blogs')

        const user = {
            username: 'testaaja',
            password: 'tsalasana',
        }
    
        const authorization = await api
            .post('/api/login')
            .send(user)
    
        const token = authorization.body.token    

        const id = blogsAtStart.body[0].id

        const newBlog = {
            title: blogsAtStart.body[0].title,
            author: blogsAtStart.body[0].author,
            url: blogsAtStart.body[0].url,
            likes: 100
        }

        await api
            .put(`/api/blogs/${id}`)
            .set({'Authorization': `bearer ${token}`})
            .send(newBlog)

        const blogsAtEnd = await api
            .get('/api/blogs')

        expect(blogsAtEnd.body[0].likes).toBe(newBlog.likes)
    })
})

describe('user tests', () => {

    test.only('creation success with a fresh username', async () => {
 
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'testaaja3',
            name: 'Tellervo Testaaja',
            password: 'tsalasana3',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd.length).toBe(usersAtStart.length + 1)
        
        const usernames = usersAtEnd.map(user => user.username)
        expect(usernames).toContain(newUser.username)
    })
})    

describe('username validation tests', () => {
    
    test('too short username', async () => {
        
        const newUser = {
            name: 'Mika Koski',
            username: 'm',
            password: 'passu'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            
        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd.length).toBe(2)


    })

    test('no username', async () => {
        
        const newUser = {
            name: 'Mika Koski', 
            password: 'passu'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd.length).toBe(2)

    })

    test('unique username can be added', async () => {
        
        const newUser = {
            name: 'Mikro Mies',
            username: 'root', 
            password: 'passu'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)

        const usersAtEnd = await helper.usersInDb()  


        expect(usersAtEnd.length).toBe(3)

    })

    test('not unique username', async () => {
       
        const newUser = {
            name: 'Teppo Testaaja',
            username: 'testaaja', 
            password: 'tsalasana'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd.length).toBe(2)

    })
    
    
})

describe('password validation tests', () => {

    test('too short password', async () => {
       
        const newUser =  {
            name: 'Mika Koski',
            username: 'mika',
            password: 'pa'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAtEnd = await helper.usersInDb()    

        expect(usersAtEnd.length).toBe(2)

    })

    test('no password', async () => {
        
        const newUser =  {
            name: 'Mika Koski',
            username: 'mikki',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            
        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd.length).toBe(2)

    })
})  
    

afterAll(() => {
    mongoose.connection.close()
})


