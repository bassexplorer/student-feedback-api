const express = require('express');
// Moddel class
// const User = require('../models/user');
const router = express.Router();
const _ = require('lodash');
const auth = require('../middleware/authenticate');
const admin = require('../middleware/admin');
const student = require('../middleware/student');
const lecturer = require('../middleware/lecturer');

// This is where we split the loged in user according to their role in the system

router.get('/admin', [auth,admin] ,async (request, response) => {

    response.send(JSON.stringify({
        welcome: 'It is admin territory, and I assume if you are here you are one... but to be honest unlike other places, here you are not more than anybody. Equality...Sorry, bro! :D',
        ...request.user
    }));


});


// Get all information that the user's have
router.get('/:userId', [auth,student,lecturer] ,async (request, response) => {

    response.send(JSON.stringify({
        welcome: 'it is for every user',
        task: 'get all information that a user have.',
        ...request.user
    }));


});



module.exports = router;