const express = require('express');
const router = express.Router();
const _ = require('lodash');
const auth = require('../middleware/authenticate');
const allUser = require('../middleware/all-user')
const User = require('../models/user');
//--------------------------------------------------------------------------------
// this gives back all of the lecturers by the connected institution ID
router.get('/:instId', [auth, allUser], async (request, response) => {

    try {

        const institutionID = User.validate({
            institution: {
                instId: request.params.instId
            }
        });
        if (institutionID.error) throw {
            statusCode: 409,
            message: institutionID.error
        };

        console.log('the fucking INST ID',institutionID.value)
        const lecturers = await User.readLecturerByInst(institutionID.value.institution.instId);

        response.send(JSON.stringify(lecturers));

    } catch (err) {

        let errorMessage;
        /* beautify preserve:start */
        if (!err.statusCode) { errorMessage = { statusCode: 500, message: err}} else { errorMessage = err}
        /* beautify preserve:end */

        response.status(errorMessage.statusCode).send(JSON.stringify(errorMessage));
    }

});


module.exports = router;