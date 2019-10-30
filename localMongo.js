

const mongoose = require('mongoose')

/*if ( process.argv.length<3 ) {
  console.log('give password as argument')
  process.exit(1)
}*/



//const password = process.argv[2]
const title = process.argv[2]
const author = process.argv[3]
const url = process.argv[4]
const likes = process.argv[5]

const murl =
// `mongodb+srv://fullstackDB:${password}@cluster0-qq9is.mongodb.net/bloglist?retryWrites=true`
  'mongodb://127.0.0.1:27017/bloglist'

mongoose.connect(murl, { useNewUrlParser: true, useUnifiedTopology: true })

const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number
})

blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Blog = mongoose.model('Blog', blogSchema)

const blog = new Blog({
    title: title,
    author: author,
    url: url,
    likes: likes
})

if (title && author && url && likes){
    blog.save().then(response => {
        console.log(`added ${title} author: ${author}, url: ${url}, likes: ${likes} to bloglist`)
        console.log(response)

        mongoose.connection.close()
    })
}


if (process.argv.length<3) {
    console.log('Bloglist:')
    Blog.find({}).then(result => {
        result.forEach(blog => {
            console.log(blog)
            //console.log(`${blog.title} ${blog.author} ${blog.blogUrl} ${blog.likes}`)
        })
        mongoose.connection.close()
    })
}
