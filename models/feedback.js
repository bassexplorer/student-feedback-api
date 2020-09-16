const connection = require('../config/connection');
const sql = require('mssql');
const Joi = require('joi');


class Feedback {

    // constructor
    // static validate for the feedbackObj
    // readById --> FInd a feedback by its ID
    // readByOwner --> find a feedback by its Owner(student)
    // readByTarget :D --> find a feedback by its Target(lecturer)
    // create feedback method --> put a feedback into the DB created by Student



    constructor(feedbackObj) {
        this.feedbackId = feedbackObj.feedbackId;
        this.title = feedbackObj.title;
        this.content = feedbackObj.content;
        this.ownerId = feedbackObj.ownerId;
        this.lecturerId = feedbackObj.lecturerId;
        this.isRead = feedbackObj.isRead;

    }


    // validate a feedback.
    static validate(userObj) {
        const schema = Joi.object({
            feedbackId: Joi
                .number()
                .integer()
                .min(1),
            title: Joi
                .string()
                .min(1)
                .max(255),
            content: Joi
                .string()
                .min(1),
            ownerId: Joi
                .number()
                .integer()
                .min(1),
            lecturerId: Joi
                .number()
                .integer()
                .min(1),
            isRead: Joi
                .boolean(),

        });

        return schema.validate(userObj);
    }


    // find a feedback by its ID 
    // readByID()
    static readByID(feedbackID) {
        return new Promise((resolve, reject) => {

            (async () => {

                try {

                    const pool = await sql.connect(connection);
                    const result = await pool.request()
                        .input('feedbackID', sql.Int(), feedbackID)
                        .query(`
                        SELECT *
                        FROM feedback_app.feedback
                        INNER JOIN feedback_app.feedback_user_allowed
                        ON FK_feedbackID = feedbackID
                        WHERE feedback.feedbackID = @feedbackID
                        `);


                    console.log(result);

                    if (!result.recordset[0]) throw {
                        statusCode: 404,
                        message: 'Feedback is not found'
                    };

                    if (result.recordset.length > 1) throw {
                        statusCode: 500,
                        message: 'Database is corrupted'
                    };

                    const record = {
                        feedbackId: result.recordset[0].feedbackID,
                        title: result.recordset[0].title,
                        content: result.recordset[0].content,
                        ownerId: result.recordset[0].FK_userID_owner,
                        lecturerId: result.recordset[0].FK_userID_lecturer,
                        isRead: result.recordset[0].is_read,
                    }

                    /* beautify preserve:start */
                    const {error} = Feedback.validate(record);
                    if (error) throw { statusCode: 409, message: error};
                    /* beautify preserve:end */

                    resolve(new Feedback(record));

                } catch (err) {
                    console.log(err);

                    let errorMessage;
                    /* beautify preserve:start */
                    if (!err.statusCode) { errorMessage = { statusCode: 500, message: err }} else { errorMessage = err;}
                    /* beautify preserve:end */
                    reject(errorMessage);
                }

                sql.close();

            })();

        });
    }

    // ----------------------WORKING -------------------------
    // find feedbacks by its ownerID and list them by looping throught the results 
    static readByOwner(ownerID) {
        return new Promise((resolve, reject) => {

            (async () => {

                try {

                    const pool = await sql.connect(connection);
                    const result = await pool.request()
                        .input('ownerID', sql.Int(), ownerID)
                        .query(`
                        SELECT *
                        FROM feedback_app.feedback
                        INNER JOIN feedback_app.feedback_user_allowed
                        ON FK_feedbackID = feedbackID
                        WHERE feedback.FK_userID_owner = @ownerID
                        `);


                    console.log(result);

                    if (!result.recordset[0]) throw {
                        statusCode: 404,
                        message: 'There is no feedback found'
                    };

                    const feedback = [];

                    result.recordset.forEach(record => {

                        const feedbackWannabe = {
                            feedbackId: record.feedbackID,
                            title: record.title,
                            content: record.content,
                            ownerId: record.FK_userID_owner,
                            lecturerId: record.FK_userID_lecturer,
                            isRead: record.is_read,
                        }

                        /* beautify preserve:start */
                        const {error} = Feedback.validate(feedbackWannabe);
                        if (error) throw { statusCode: 409, message: error + ' from readByOwner'};
                        /* beautify preserve:end */

                        feedback.push(new Feedback(feedbackWannabe));

                    });

                    resolve(feedback);

                } catch (err) {
                    console.log(err);

                    let errorMessage;
                    /* beautify preserve:start */
                    if (!err.statusCode) { errorMessage = { statusCode: 500, message: err }} else { errorMessage = err;}
                    /* beautify preserve:end */
                    reject(errorMessage);
                }

                sql.close();

            })();

        });
    }

    // -----------------------------WORKING------ MISSING READ STATE !!!!!!!-----------------------
    // find feedbacks by its targetID  (lecturer)
    static readByTarget(targetID, isReadState) {
        return new Promise((resolve, reject) => {

            (async () => {

                try {
                    let result;
                    if (isReadState == 0 || !isReadState) { // select all of the feedbacks

                        const pool = await sql.connect(connection);
                        result = await pool.request()
                            .input('targetID', sql.Int(), targetID)
                            .query(`
                        SELECT *
                        FROM feedback_app.feedback
                            INNER JOIN feedback_app.feedback_user_allowed
                            ON FK_feedbackID = feedbackID
                        WHERE feedback_user_allowed.FK_userID_lecturer = @targetID
                    `);

                    } 
                    if (isReadState == 1)  { // select just the feedbacks with "isRead = false" value 

                        const pool = await sql.connect(connection);
                        result = await pool.request()
                            .input('targetID', sql.Int(), targetID)
                            .query(`
                        SELECT *
                        FROM feedback_app.feedback
                            INNER JOIN feedback_app.feedback_user_allowed
                            ON FK_feedbackID = feedbackID
                        WHERE feedback_user_allowed.FK_userID_lecturer = @targetID 
                        AND feedback.is_read = 0
                    `);

                    }
                    console.log(result);

                    if (!result.recordset[0]) throw {
                        statusCode: 404,
                        message: 'Feedback is not found'
                    };

                    const feedback = [];

                    result.recordset.forEach(record => {

                        const feedbackWannabe = {
                            feedbackId: record.feedbackID,
                            title: record.title,
                            content: record.content,
                            isRead: record.is_read,
                            ownerId: record.FK_userID_owner,
                            lecturerId: record.FK_userID_lecturer,
                        }

                        /* beautify preserve:start */
                        const {error} = Feedback.validate(feedbackWannabe);
                        if (error) throw { statusCode: 409, message: error};
                        /* beautify preserve:end */

                        feedback.push(new Feedback(feedbackWannabe));

                    });

                    resolve(feedback);


                } catch (err) {
                    console.log(err);

                    let errorMessage;
                    /* beautify preserve:start */
                if (!err.statusCode) { errorMessage = { statusCode: 500, message: err }} else { errorMessage = err;}
                /* beautify preserve:end */
                    reject(errorMessage);
                }

                sql.close();

            })();

        });
    }

    //--------------------------------------------------------------------
    // Update a feedback visibility state 
    static updateIsReadState(feedbackID) {
        return new Promise((resolve, reject) => {

            (async () => {

                try {

                    const pool = await sql.connect(connection);
                    const result = await pool.request()
                        .input('feedbackID', sql.Int(), feedbackID)
                        .query(`
                        UPDATE feedback_app.feedback
                        SET is_read = 1
                        WHERE feedback.feedbackID = @feedbackID;

                        SELECT *
                        FROM feedback_app.feedback
                        INNER JOIN feedback_app.feedback_user_allowed
                        ON FK_feedbackID = feedbackID
                        WHERE feedback.feedbackID = @feedbackID;

                        `);


                    console.log(result);

                    if (!result.recordset[0]) throw {
                        statusCode: 404,
                        message: 'Feedback is not found'
                    };

                    if (result.recordset.length > 1) throw {
                        statusCode: 500,
                        message: 'Database is corrupted'
                    };

                    const record = {
                        feedbackId: result.recordset[0].feedbackID,
                        title: result.recordset[0].title,
                        content: result.recordset[0].content,
                        ownerId: result.recordset[0].FK_userID_owner,
                        lecturerId: result.recordset[0].FK_userID_lecturer,
                        isRead: result.recordset[0].is_read,
                    }

                    /* beautify preserve:start */
                    const {error} = Feedback.validate(record);
                    if (error) throw { statusCode: 409, message: error};
                    /* beautify preserve:end */

                    resolve(new Feedback(record));

                } catch (err) {
                    console.log(err);

                    let errorMessage;
                    /* beautify preserve:start */
                    if (!err.statusCode) { errorMessage = { statusCode: 500, message: err }} else { errorMessage = err;}
                    /* beautify preserve:end */
                    reject(errorMessage);
                }

                sql.close();

            })();

        });
    }
    // ----------------------------------WORKING---------------------------
    // CREATE a feedback and push it into the Database 
    create() {
        return new Promise((resolve, reject) => {

            (async () => {

                try {
                    const pool = await sql.connect(connection);
                    const result = await pool.request()
                        .input('title', sql.NVarChar(255), this.title)
                        .input('content', sql.NVarChar(sql.MAX), this.content)
                        .input('lecturerId', sql.Int(), this.lecturerId)
                        .input('ownerId', sql.Int(), this.ownerId)
                        .query(`
                        DECLARE @inserted TABLE(ID INT)

                        INSERT INTO feedback_app.feedback
                            (title, content, FK_userID_owner)

                        OUTPUT INSERTED.feedbackID INTO @inserted

                        VALUES (@title, @content, @ownerId)

                        INSERT INTO feedback_app.feedback_user_allowed
                            (FK_userID_lecturer, FK_feedbackID)
                        VALUES (@lecturerId, (SELECT ID FROM @inserted))

                        SELECT fb.*, f2c.*
                        FROM feedback_app.feedback fb
                            INNER JOIN feedback_app.feedback_user_allowed f2c
                            ON FK_feedbackID = feedbackID
                        WHERE fb.feedbackID = (SELECT ID FROM @inserted)
                        
                        `);

                    console.log(result);


                    if (result.recordset.length != 1) throw {
                        statusCode: 500,
                        message: 'Database is corrupted'
                    };

                    const record = {
                        feedbackId: result.recordset[0].feedbackID,
                        title: result.recordset[0].title,
                        content: result.recordset[0].content,
                        isRead: result.recordset[0].is_read,
                        ownerId: result.recordset[0].FK_userID_owner,
                        lecturerId: result.recordset[0].FK_userID_lecturer,
                    }

                    /* beautify preserve:start */
                    const {error} = Feedback.validate(record);
                    if (error) throw { statusCode: 409, message: error};
                    /* beautify preserve:end */


                    resolve(new Feedback(record));

                } catch (err) {
                    console.error(err);
                    let errorMessage;
                    /* beautify preserve:start */
                if(!err.statusCode){ errorMessage = { statusCode: 500, message: err}}else{ errorMessage = err;}
                /* beautify preserve:end */

                    reject(errorMessage);
                }

                sql.close();

            })();

        });
    }

}

module.exports = Feedback;