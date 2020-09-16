const express = require('express');
// model that take care of the finctions in conection to the user
const User = require('../models/user');
const router = express.Router();
const _ = require('lodash');



router.post('/', async (request, response) => {

    const userWannabe = _.omit(request.body, 'password');
    const passwordWannabe = _.pick(request.body, 'password');
    try {
        /* beautify preserve:start */
        const validateUser = User.validate(userWannabe);
        if (validateUser.error) throw { statusCode: 400, message: validateUser.error};
        
        // Protect the possibility to a user register as Admin.(even thought it is not implemented.)
        if(!request.body.role || request.body.role.roleId <2) throw { statusCode: 405, message: 'That methood not allowed.'};
        
        const valdatePassword = User.validateLoginInfo(passwordWannabe);
        if (passwordWannabe.error) throw { statusCode: 400, message: passwordWannabe.error};
        
        // here we check with user.readByEmail(userWannabe.userEmail) if the user already exists
        const existingUser = await User.readByEmail(userWannabe.userEmail);
        throw { statusCode: 403, message: 'Cannot save user in DB'}
        /* beautify preserve:end */
        
        

    } catch (userCheckError) {
        try {
            
            if (userCheckError.statusCode != 404) throw userCheckError;

            const newUser = await new User(userWannabe).create(passwordWannabe);
            console.log(newUser);
            response.send(JSON.stringify(newUser));

        } catch (err) {

            console.log(err);
            let errorMessage;
            /* beautify preserve:start */
            if (!err.statusCode) { errorMessage = { statusCode: 500, message: err }} else { errorMessage = err;}
            /* beautify preserve:end */

            response.status(errorMessage.statusCode).send(JSON.stringify(errorMessage));
        }

    }


});


module.exports = router;