const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const session = require('cookie-session')
const User = require('./model/User')
const methodOverride = require('method-override')
const Post = require('./model/Schema')
const dotenv = require('dotenv');

const DB = 'mongodb+srv://ashjha03:QEmXL617Ynt494Xp@cluster0.smpdbqt.mongodb.net/postify?retryWrites=true&w=majority'

dotenv.config()
mongoose.set('strictQuery', false)

mongoose.connect(DB)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err))

app.use(methodOverride('_method'))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))

const isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        return res.render('login')
    }
    next();
}

app.get('/', async (req, res) => {
    const posts = await Post.find()
    const user = req.user
    res.render('home', {posts, user})
})

app.get('/myPosts', isLoggedIn, async (req, res) => {
    const posts = await Post.find()
    const user = req.user
    res.render('myPosts', {posts, user})
})

app.get('/post/:id', async (req, res) => {
    const {id} = req.params
    const post = await Post.findById(id)
    const user = req.user
    res.render('post', {post, user})
})

app.get('/post/:id/edit', isLoggedIn, async (req, res) => {
    const {id} = req.params
    const post = await Post.findById(id)
    const user = req.user
    res.render('editForm', {post, user})
})

app.post('/newPost', async (req, res) => {
    const {title, desc, imgUrl} = req.body;
    const userName = req.user.username
    const post = new Post({title, desc, imgUrl, userName})
    await post.save()
    res.redirect('/')
})

app.put('/post/:id', async (req, res) => {
    const {id} = req.params
    const data = req.body
    await Post.findByIdAndUpdate(id, data)
    res.redirect('/post/'+id)
})

app.delete('/post/:id', async (req, res) => {
    const {id} = req.params
    const post = await Post.findById(id)
    await post.delete()
    res.redirect('/')
})

app.get('/login', (req, res) => {
    const user = req.user
    res.render('login', {user})
})

app.get('/register', (req, res) => {
    const user = req.user
    res.render('register', {user})
})

app.post('/register', async (req, res) => {
    const {username, email, password} = req.body
    const user = new User({username, email, password})
    await User.register(user, password)
    res.redirect('/login')
})

app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), 
    (req, res) => {
        res.redirect('/');
})

app.post('/logout', function(req, res, next){
    req.logout()
    res.redirect('/')
})

app.listen(3000, () => {
    console.log(`Serving on port 3000`)
})

module.exports = app