const express = require('express');
// Model that take care of the actions in connection the users
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const router = express.Router();
const crypt = require('../config/encrypt');

// this route handles the login procedure
// validate login info 
// add the token to it with the valid "rule"
router.post('/student', async (request, response) => {


    try {
        // validate the login info formate 
        /* beautify preserve:start */
        const {error} = User.validateLoginInfo(request.body);
        if (error) throw { statusCode: 409, message: error};
        /* beautify preserve:end */

        // check the credentials correctness
        const loggedInUser = await User.checkCredentials(request.body);
        console.log('logged in user from login', loggedInUser);

        if (loggedInUser.role.roleName != 'student' && loggedInUser.role.roleName != 'admin') throw {
            statusCode: 403,
            message: `You are not a student.`,
        };

        // add the token to it if correct to be able to use it to get access to the connected routes
        const token = await jwt.sign(JSON.stringify(loggedInUser), crypt.jwtPrivateKey);
        loggedInUser.token = token;

        console.log('token from login', token);

        response.send(JSON.stringify(loggedInUser));

    } catch (err) {

        let errorMessage;
        /* beautify preserve:start */
        if (!err.statusCode) { errorMessage = { statusCode: 500, message: err}} else { errorMessage = err}
        /* beautify preserve:end */

        response.status(errorMessage.statusCode).send(JSON.stringify(errorMessage));
    }



});


router.post('/lecturer', async (request, response) => {


    try {
        // validate the login info formate 
        /* beautify preserve:start */
        const {error} = User.validateLoginInfo(request.body);
        if (error) throw { statusCode: 409, message: error};
        /* beautify preserve:end */

        // check the credentials correctness
        const loggedInUser = await User.checkCredentials(request.body);
        console.log('logged in user from login', loggedInUser);

        if (loggedInUser.role.roleName != 'lecturer' && loggedInUser.role.roleName != 'admin')
            throw {
                statusCode: 403,
                message: 'You are not a lecturer.'
            };

        // add the token to it if correct to be able to use it to get access to the connected routes
        const token = await jwt.sign(JSON.stringify(loggedInUser), crypt.jwtPrivateKey);
        loggedInUser.token = token;

        console.log('token from login', token);

        response.send(JSON.stringify(loggedInUser));

    } catch (err) {

        let errorMessage;
        /* beautify preserve:start */
        if (!err.statusCode) { errorMessage = { statusCode: 500, message: err}} else { errorMessage = err}
        /* beautify preserve:end */

        response.status(errorMessage.statusCode).send(JSON.stringify(errorMessage));
    }


});


module.exports = router;