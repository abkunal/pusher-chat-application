/*
    GENERATE JWT TOKENS FOR CHATKIT API
 */

var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

router.post('/', (req, res) => {
    if (req.query.user_id && req.query.user_id !== '') {
        let expire = Math.floor(Date.now() / 1000) + (60 * 60 * 23);

        let token = jwt.sign({
            "app": YOUR_INSTANCE_ID,
            "iss": "api_keys/<KEY_ID>",
            "exp": expire,
            "sub": req.query.user_id
        }, YOUR_KEY_SECRET)

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
