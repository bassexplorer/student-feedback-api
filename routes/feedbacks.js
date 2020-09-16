const express = require('express');
const Feedback = require('../models/feedback');
const router = express.Router();
const _ = require('lodash');
const auth = require('../middleware/authenticate');
const admin = require('../middleware/admin');
const student = require('../middleware/student');
const lecturer = require('../middleware/lecturer');
const allUser = require('../middleware/all-user')

//------------------------------------------WORKING--------------------------------------
// Get all feedback that student created
// get all my feedbacks
router.get('/student', [auth, student], async (request, response) => {

    //readByOwner() 
    try {
        // console.log(request.user.ownerId);
        const student = await Feedback.readByOwner(request.user.userId);

        response.send(JSON.stringify(student));

    } catch (err) {

        let errorMessage;
        /* beautify preserve:start */
        if (!err.statusCode) { errorMessage = { statusCode: 500, message: err}} else { errorMessage = err}
        /* beautify preserve:end */


        response.status(errorMessage.statusCode).send(JSON.stringify(errorMessage));
    }

});


//---------------------------------WORKING--------------------------------------------
// POST a feedback that a student created
router.post('/student/add', [auth, student], async (request, response) => {

    // REQUIRES an object like
    /* feedback:{
        title: this.title,
        content: this.content,
        lecturerId: this.lecturerId,
        ownerId: this.ownerId
    }

    // create() comes here
    */
    try {
        const feedbackWannabe = {
            ...request.body,
            ownerId: request.user.userId
        }
        console.log(feedbackWannabe);
        /* beautify preserve:start */
    const {error} = Feedback.validate(feedbackWannabe);
    if (error) throw { statusCode: 409, message: error};
    /* beautify preserve:end */

        const newFeedback = await new Feedback(feedbackWannabe).create()

        response.send(JSON.stringify(newFeedback));

    } catch (err) {

        let errorMessage;
        /* beautify preserve:start */
    if (!err.statusCode) { errorMessage = { statusCode: 500, message: err}} else { errorMessage = err}
    /* beautify preserve:end */


        response.status(errorMessage.statusCode).send(JSON.stringify(errorMessage));
    }


});


//----------------------------WORKS-----------------------------------------
// get the feedbacks back that the all of the students created by lectureID
// thats for ALL the users who want to see the previous feedbacks
router.get('/all/:lectureId', [auth, allUser], async (request, response) => {

    // RETURNS an array filled with objects like
    /* feedback:{
        title: this.title,
        content: this.content,
        isRead: false,
        ownerId: this.ownerId,
        owner: randomName
    }*/

    try {

        const lectureID = Feedback.validate({
            lecturerId: request.params.lectureId
        });
        if (lectureID.error) throw {
            statusCode: 409,
            message: lectureID.error
        };

        const lecturer = await Feedback.readByTarget(lectureID.value.lecturerId);

        response.send(JSON.stringify(lecturer));

    } catch (err) {

        let errorMessage;
        /* beautify preserve:start */
        if (!err.statusCode) { errorMessage = { statusCode: 500, message: err}} else { errorMessage = err}
        /* beautify preserve:end */

        response.status(errorMessage.statusCode).send(JSON.stringify(errorMessage));
    }

});

//-------------------------------------------------------------------------------------
// Get all feedback that the lecturer received thats for JUST the lecturers
// get all my rececived feedbacks for lecturers
router.get('/lecturer', [auth, lecturer], async (request, response) => {

    try {

        const lecturer = await Feedback.readByTarget(request.user.userId);

        response.send(JSON.stringify(lecturer));

    } catch (err) {

        let errorMessage;
        /* beautify preserve:start */
        if (!err.statusCode) { errorMessage = { statusCode: 500, message: err}} else { errorMessage = err}
        /* beautify preserve:end */

        response.status(errorMessage.statusCode).send(JSON.stringify(errorMessage));
    }


});

router.get('/lecturer/seen', [auth, lecturer], async (request, response) => {

    try {

        const lecturer = await Feedback.readByTarget(request.user.userId, true);

        response.send(JSON.stringify(lecturer));

    } catch (err) {

        let errorMessage;
        /* beautify preserve:start */
        if (!err.statusCode) { errorMessage = { statusCode: 500, message: err}} else { errorMessage = err}
        /* beautify preserve:end */

        response.status(errorMessage.statusCode).send(JSON.stringify(errorMessage));
    }


});


//------------------------WORKING------------------------------------------------
// update a specific feedback. / a possible improvement to make somehow visible to a student if there feedback was "seen" but then we had to store the post date and the checkOfFeedback date.

router.put('/lecturer/:feedbackId', [auth, lecturer], async (request, response) => {

    try {
        const feedbackID = Feedback.validate({
            feedbackId: request.params.feedbackId
        });
        if (feedbackID.error) throw {
            statusCode: 409,
            message: feedbackID.error
        };

        const updatedFeedbackWannabe = await Feedback.updateIsReadState(feedbackID.value.feedbackId);

        response.send(JSON.stringify(updatedFeedbackWannabe));

    } catch (err) {

        let errorMessage;
        /* beautify preserve:start */
        if (!err.statusCode) { errorMessage = { statusCode: 500, message: err}} else { errorMessage = err}
        /* beautify preserve:end */

        response.status(errorMessage.statusCode).send(JSON.stringify(errorMessage));
    }

});


module.exports = router;