/*
    TO REGISTER A USER
 */

var express = require('express');
var router = express.Router();
var Chatkit = require('pusher-chatkit-server');

const chatkit = new Chatkit.default({
    instanceLocator: "v1:us1:6b4c65c1-949b-4807-99ad-d5ad8c8ac52a",
    key: "7ba5c242-f840-43a7-8ec1-a4e44b23cc1e:1L4Ng1zmBVwpnsQhuIB2nCEAq65WFGEx29+ICjBarQE="
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