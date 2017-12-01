var express = require('express');
var router = express.Router();
var Chatkit = require('pusher-chatkit-server');


const chatkit = new Chatkit.default({
    instanceLocator: "v1:us1:725bf3f7-3373-4c90-811b-8addf4e23404",
    key: "95b75f1f-a371-4d80-8ad0-f4da8a5a74bc:HS225BLyJnYCL+5G5CQRYxTSuCcuAOUua9HCz2+UFFw=",
});

router.get('/', (req, res) => {
    if (req.query.nickname && req.query.nickname !== '') {
        chatkit.createUser(req.query.nickname, req.query.nickname)
            .then(() => {
                console.log('user successfully created');
                res.end('success');
            }).catch((err) => {
                console.log('error creating user');
                res.end('user already exists');
        });
    } else {
        res.end('Give a nickname');
    }
});

module.exports = router;