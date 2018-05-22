const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/user');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var router = express.Router();
var API = require('./routes/api')

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

const JWt_SECRET = 'mySecret';
mongoose.connect('mongodb://localhost:27017/stmdb');

var userRoutes = ['/api/myprojects', '/api/mylatestprojects/',
    '/api/project/', '/api/mylatesttasks/', '/api/tasks/project/',
    '/api/task/', '/api/mytasks/project/', '/api/mylatestcomments/',
    '/api/comment/', '/api/mycomments/task/', '/api/user',
    '/api/myuser', '/api/user/resetmypwd', '/api/myprogress'];

//Enable CORS 
app.use(cors());


app.all('/api/**', (req, res, next) => {
    console.log('API: ');
    let token = getTokenFromHeader(req);
    try {
        let decoded = jwt.verify(token, JWt_SECRET);
        console.log('decoded token: ', decoded.data);
        User.findOne({ 'username': decoded.data }, (err, user) => {
            if (user) {
                res.locals.username = user.username;
                res.locals.currentUserId = user._id;
                res.locals.userRole = user.beautifyRoleName;
                //No need to check permissions for Admin role because he has full access
                if (user.beautifyRoleName === 'User') {
                    checkPermission(req, res, next)
                } else {
                    next();
                }
            } else {
                res.send({ message: 'User not found!' });
            }
        });
    } catch (err) {
        console.log('err', err);
        res.sendStatus(401);
    }
});

app.use('/api', API);

//In case you use stm-web inside this backend copy everything inside stm-web build folder
//and copy it in the main folder here and uncomment this
/*
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})
*/

//This function used for test only in production mode it needs to be deleted
/*
app.post('/register', (req, res) => {
    var user = new User(req.body);
    user.save((err) => {
        if (err)
            res.send(err);
        res.send({ message: 'User Added' });
    });
})
*/

app.post('/auth', function (req, res) {
    User.findOne({
        username: req.body.username,
        password: req.body.password
    }, (err, user) => {
        if (user === null) {
            res.send({ message: 'Invalide username or password!' });
            return;
        }
        if (user.token && user.token !== '') {
            console.log('token1: ', user.token);
            res.send({ token: user.token });
        } else {
            user.set('token', jwt.sign({ data: user.username }, JWt_SECRET));
            console.log('token2: ', user.token);
            user.save((err) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send({ token: user.token });
                }
            })
        }
    });
})


app.post('/logout', function (req, res) {
    //console.log('jsonuser: ', req.body);
    User.findOne({ username: req.body.username }, (err, user) => {
        user.set('token', '');
        user.save((err) => {
            if (err) {
                res.send(err);
            } else {
                jwt.in
                res.send({ message: 'logout success' });
            }
        })
    });
})

app.listen(8080, () => {
    console.log(`Server is running at: 8080`);
});

function checkPermission(req, res, next) {
    console.log('req:: ', req.url);
    //Can't break arra.map that's why using regular for loop
    for (var i = 0; i < userRoutes.length; i++) {
        console.log('route:: ', userRoutes[i]);
        if (req.url.startsWith(userRoutes[i])) {
            next();
            break;
        }
        if(i == ( userRoutes.length - 1 ) ){
            res.sendStatus(401);
        }
      }
}

function getTokenFromHeader(req) {
	//console.log('headers: ', req.get('Authorization'));
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    } else {
        return '';
    }
}