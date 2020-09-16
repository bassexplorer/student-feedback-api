const connection = require('../config/connection');
const sql = require('mssql');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const crypt = require('../config/encrypt');


class User {

    // constructor
    // static validate for the userObj
    // static validate logininfo
    // static checkCredentials
    // create methood to be able to register a user

    constructor(userObj) {
        this.userId = userObj.userId;
        this.userEmail = userObj.userEmail;
        this.firstName = userObj.firstName;
        this.lastName = userObj.lastName;
        // add info about the users role --> role obj
        if (userObj.role) {
            this.role = {}
            this.role.roleId = userObj.role.roleId;
            this.role.roleName = userObj.role.roleName;
            this.role.roleDesc = userObj.role.roleDesc;
        }

        if (userObj.institution) {
            this.institution = {}
            this.institution.instId = userObj.institution.instId;
            this.institution.shortName = userObj.institution.shortName;
            this.institution.fullName = userObj.institution.fullName;
        }


    }


    static validate(userObj) {
        const schema = Joi.object({
            userId: Joi
                .number()
                .integer()
                .min(1),
            userEmail: Joi
                .string()
                .email()
                .max(255),
            firstName: Joi
                .string()
                .max(255),
            lastName: Joi
                .string()
                .max(255),
            // add info about the users role --> role obj
            role: Joi.object({

                roleId: Joi
                    .number()
                    .integer()
                    .min(1),
                roleName: Joi
                    .string()
                    .min(1)
                    .max(255),
                roleDesc: Joi
                    .string()
                    .max(255),
            }),
            institution: Joi.object({

                instId: Joi
                    .number()
                    .integer()
                    .min(1),
                shortName: Joi
                    .string()
                    .min(1)
                    .max(10),
                fullName: Joi
                    .string()
                    .max(255),
            })

            // in a real life scenario we will have more about a user.
        });

        return schema.validate(userObj);
    }


    // we use this wen we want to validate that the user give us valide login information before we try to log in the user.
    static validateLoginInfo(loginInfoObj) {

        const schema = Joi.object({
            email: Joi
                .string()
                .email()
                .max(255),
            password: Joi
                .string()
                .min(3)
                .max(255),

        });

        return schema.validate(loginInfoObj);
    }

    // after we validated the login infos we check if the user is in the system
    static checkCredentials(loginInfoObj) {
        return new Promise((resolve, reject) => {

            (async () => {
  
                try {

                    const pool = await sql.connect(connection);
                    const result = await pool.request()
                        .input('userEmail', sql.NVarChar(255), loginInfoObj.email)
                        .query(`
                        SELECT ua.*, up.*, ur.*,iu.*, inst.*

                        FROM feedback_app.user_account ua
                        
                            INNER JOIN feedback_app.user_password up
                            ON ua.userID = up.FK_userID
                        
                            INNER JOIN feedback_app.user_role ur
                            ON ua.FK_roleID = ur.roleID
                        
                            INNER JOIN feedback_app.inst_user iu
                            ON  ua.userID = iu.FK_userID 
                        
                            INNER JOIN feedback_app.institution inst
                            ON  iu.FK_instID = inst.instID
                            
                        WHERE ua.user_email =  @userEmail 
                        `);

                    console.log(result);
                    /* beautify preserve:start */
                    if (!result.recordset[0]) throw { statusCode: 404,  message: 'User is not found'};
                    if (result.recordset.length > 1) throw { statusCode: 500, message: 'Database is corrupted'};

                    const match = await bcrypt.compare(loginInfoObj.password, result.recordset[0].hashed_password);
                    if(!match) throw { statusCode: 404,  message: 'User is not found'};
                    /* beautify preserve:end */

                    const record = {
                        userId: result.recordset[0].userID,
                        userEmail: result.recordset[0].user_email,
                        firstName: result.recordset[0].first_name,
                        lastName: result.recordset[0].last_name,
                        role: {
                            roleId: result.recordset[0].roleID,
                            roleName: result.recordset[0].role_name,
                            roleDesc: result.recordset[0].role_desc
                        },
                        institution: {
                            instId: result.recordset[0].instID,
                            shortName: result.recordset[0].short_form,
                            fullName: result.recordset[0].full_name
                        }
                    }

                    /* beautify preserve:start */
                    const {error} = User.validate(record);
                    if (error) throw { statusCode: 409,  message: error};
                    /* beautify preserve:end */

                    resolve(record);

                } catch (err) {
                    let errorMessage;
                    /* beautify preserve:start */
                    if(!err.statusCode){ errorMessage = {  statusCode: 500, message: err}}else{ errorMessage = err}
                    /* beautify preserve:end*/

                    reject(errorMessage);
                }

                sql.close();

            })();

        });
    }


    // readByEmail()
    // for checking if a user is exising in the system or not 
    static readByEmail(email) {
        return new Promise((resolve, reject) => {

            (async () => {

                try {

                    const pool = await sql.connect(connection);
                    const result = await pool.request()
                        .input('userEmail', sql.NVarChar(255), email)
                        .query(`
                                SELECT userID, user_email
                                FROM feedback_app.user_account 
                                WHERE user_email = @userEmail;
                                `);


                    console.log(result);

                    if (!result.recordset[0]) throw {
                        statusCode: 404,
                        message: 'User is not found'
                    };

                    if (result.recordset.length > 1) throw {
                        statusCode: 500,
                        message: 'Database is corrupted'
                    };

                    const record = {
                        userId: result.recordset[0].userID,
                        userEmail: result.recordset[0].user_email,
                    }

                    /* beautify preserve:start */
                    const {error} = User.validate(record);
                    if (error) throw { statusCode: 409, message: error};
                    /* beautify preserve:end */

                    resolve(new User(record));

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

    //---------------------------------------------------------------------------------------------
    // readLecturerByInst
    static readLecturerByInst(instID) {
        return new Promise((resolve, reject) => {

            (async () => {

                try {

                    const pool = await sql.connect(connection);
                    const result = await pool.request()
                        .input('instID', sql.Int(), instID)
                        .query(`
                        SELECT *
                        FROM feedback_app.user_account
                            INNER JOIN feedback_app.inst_user
                            ON inst_user.FK_userID = user_account.userID
                            INNER JOIN feedback_app.institution
                            ON  inst_user.FK_instID = institution.instID
                            INNER JOIN feedback_app.user_role
                            ON user_account.FK_roleID = user_role.roleID
                        WHERE inst_user.FK_instID = @instID AND user_role.roleID = 3;
                                `);


                    console.log(result);

                    if (!result.recordset[0]) throw {
                        statusCode: 404,
                        message: `There is no lecturer in that institution by id ${instID}`
                    };

                   const lecturers = []

                    result.recordset.forEach(record =>{

                        const lecturerWannabe = {
                            userId: record.userID,
                            userEmail: record.user_email,
                            firstName: record.first_name,
                            lastName: record.last_name,
                            role: {
                                roleId: record.roleID,
                                roleName: record.role_name,
                                roleDesc: record.role_desc
                            },
                            institution: {
                                instId: record.instID,
                                shortName: record.short_form,
                                fullName: record.full_name
                            }
                        }

                        
                        /* beautify preserve:start */
                        const {error} = User.validate(lecturerWannabe);
                        if (error) throw { statusCode: 409, message: error};
                        /* beautify preserve:end */
                        lecturers.push(new User(lecturerWannabe));

                    });

                    resolve(lecturers);


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


    //create(optionsObj) :: optionsObj{ password: '123123123', ...userObj}
    // const user = new User(userData);
    // user.create(optionObj)

    create(optionsObj) {
        return new Promise((resolve, reject) => {

            (async () => {

                try {
                    const hashedPassworrd = await bcrypt.hash(optionsObj.password, crypt.saltRounds);
                    const pool = await sql.connect(connection);
                    const result = await pool.request()
                        .input('userEmail', sql.NVarChar(255), this.userEmail)
                        .input('firstName', sql.NVarChar(255), this.firstName)
                        .input('lastName', sql.NVarChar(255), this.lastName)
                        .input('instID', sql.Int(), this.institution.instId)
                        .input('roleID', sql.Int(), this.role.roleId)
                        .input('hashedPassword', sql.NVarChar(255), hashedPassworrd)

                        .query(`
                        DECLARE @inserted TABLE(ID INT)

                        INSERT INTO feedback_app.user_account 
                            (user_email, first_name, last_name, FK_roleID)
                        OUTPUT INSERTED.userID INTO @inserted
                        VALUES
                        (@userEmail, @firstName, @lastName, @roleID);
                        
                        INSERT INTO feedback_app.user_password
                            (FK_userID, hashed_password)
                        VALUES
                        ((SELECT ID FROM @inserted), @hashedPassword);
                        
                        INSERT INTO feedback_app.inst_user
                            (FK_userID, FK_instID)
                        VALUES
                            ((SELECT ID FROM @inserted), @instID);

                        SELECT ua.*,ur.*,iu.*,inst.*
                        FROM feedback_app.user_account ua

                            INNER JOIN feedback_app.user_role ur
                            ON ua.FK_roleID = ur.roleID

                            INNER JOIN feedback_app.inst_user iu
                            ON  ua.userID = iu.FK_userID 
                        
                            INNER JOIN feedback_app.institution inst
                            ON  iu.FK_instID = inst.instID

                        WHERE userID = (SELECT ID FROM @inserted);

                            `);

                            // is is count as long querry ? :"D 
                    console.log(result);


                    if (result.recordset.length != 1) throw {
                        statusCode: 500,
                        message: 'Database is corrupted'
                    };


                    const record = {
                        userId: result.recordset[0].userID,
                        userEmail: result.recordset[0].user_email,
                        firstName: result.recordset[0].first_name,
                        lastName: result.recordset[0].last_name,
                        role: {
                            roleId: result.recordset[0].roleID,
                            roleName: result.recordset[0].role_name,
                            roleDesc: result.recordset[0].role_desc
                        },
                        institution: {
                            instId: result.recordset[0].instID,
                            shortName: result.recordset[0].short_form,
                            fullName: result.recordset[0].full_name
                        }
                    }

                    /* beautify preserve:start */
                    const {error} = User.validate(record);
                    if (error) throw { statusCode: 409, message: error};
                    /* beautify preserve:end */


                    resolve(new User(record));

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
module.exports = User;