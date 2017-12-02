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
            "app": "6b4c65c1-949b-4807-99ad-d5ad8c8ac52a",
            "iss": "api_keys/7ba5c242-f840-43a7-8ec1-a4e44b23cc1e",
            "exp": expire,
            "sub": req.query.user_id
        }, "1L4Ng1zmBVwpnsQhuIB2nCEAq65WFGEx29+ICjBarQE=")

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