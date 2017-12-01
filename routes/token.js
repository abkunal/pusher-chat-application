var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

router.post('/', (req, res) => {
    if (req.query.user_id && req.query.user_id !== '') {
        let expire = Math.floor(Date.now() / 1000) + (60 * 60 * 23);
        let token = jwt.sign({
            "app": "725bf3f7-3373-4c90-811b-8addf4e23404",
            "iss": "api_keys/95b75f1f-a371-4d80-8ad0-f4da8a5a74bc",
            "exp": expire,
            "sub": req.query.user_id
        }, "HS225BLyJnYCL+5G5CQRYxTSuCcuAOUua9HCz2+UFFw=");

        let response = {
            "access_token": token,
            "expires_in": expire
        };
        console.log(response);
        res.end(JSON.stringify(response));
    } else {
        res.end('No user id given');
    }
});

module.exports = router;