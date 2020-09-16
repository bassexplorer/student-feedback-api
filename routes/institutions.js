const express = require('express');

const router = express.Router();
const _ = require('lodash');
const auth = require('../middleware/authenticate');
const allUser = require('../middleware/all-user')
const Institution = require('../models/institution');
//--------------------------------------------------------------------------------

router.get('/', [auth, allUser], async (request, response) => {

    try {
        const institution = await Institution.readAll();

        response.send(JSON.stringify(institution));

    } catch (err) {

        let errorMessage;
        /* beautify preserve:start */
        if (!err.statusCode) { errorMessage = { statusCode: 500, message: err}} else { errorMessage = err}
        /* beautify preserve:end */

        response.status(errorMessage.statusCode).send(JSON.stringify(errorMessage));
    }

});




module.exports = router;