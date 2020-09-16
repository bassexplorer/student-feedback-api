const connection = require('../config/connection');
const sql = require('mssql');
const Joi = require('joi');


class Institution {

    constructor(instObj) {
      this.instId = instObj.instId;
      this.shortName = instObj.shortName;
      this.fullName = instObj.fullName;
    }


    // validate a feedback.
    static validate(userObj) {
        const schema = Joi.object({
            instId: Joi
                .number()
                .integer()
                .min(1),
                shortName: Joi
                .string()
                .min(1)
                .max(255),
                fullName: Joi
                .string()
                .min(1)
                .max(255)

        });

        return schema.validate(userObj);
    }


    // find a feedback by its ID 
    // readByID()
    static readAll() {
        return new Promise((resolve, reject) => {

            (async () => {

                try {

                    const pool = await sql.connect(connection);
                    const result = await pool.request()
                        .query(`
                        SELECT *
                        FROM feedback_app.institution
                        `);


                    console.log(result);

                    if (!result.recordset[0]) throw {
                        statusCode: 404,
                        message: 'No institution is found'
                    };

                    const institution = [];

                    result.recordset.forEach(record => {

                        const instWannabe = {
                            instId: record.instID,
                            shortName: record.short_form,
                            fullName: record.full_name
                        }

                        /* beautify preserve:start */
                        const {error} = Institution.validate(instWannabe);
                        if (error) throw { statusCode: 409, message: error};
                        /* beautify preserve:end */

                        institution.push(new Institution(instWannabe));

                    });

                    resolve(institution);

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

  
}

module.exports = Institution;