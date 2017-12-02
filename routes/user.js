/*
    TO REGISTER A USER
 */

var express = require('express');
var router = express.Router();
var Chatkit = require('pusher-chatkit-server');

const chatkit = new Chatkit.default({
    instanceLocator: YOUR_INSTANCE_LOCATOR,
    key: YOUR_SECRET_KEY
});

router.get('/', (req, res) => {
    if (req.query.nickname && req.query.nickname !== '') {
        chatkit.createUser(req.query.nickname, req.query.nickname)
            .then(() => {
                console.log('user successfully created');
                res.end('success');
            }).catch((err) => {
                console.log('error creating user or user already exists');
                res.end('success');
        });
    } else {
        res.end('Give a nickname');
    }
});

module.exports = router;
