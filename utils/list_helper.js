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



module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
}