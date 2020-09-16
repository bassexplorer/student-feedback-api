const { request } = require("express");

const jwt = require('jsonwebtoken');
const crypt = require('../config/encrypt');

module.exports = async (request,response,next) => {
    
    try{
        const token = request.header('x-authentication-token');
        if(!token) throw {statusCode: 401, message: 'Access denied: No token provided.'};

        console.log('token from authentication',token);

        const decodedToken = await jwt.verify(token,crypt.jwtPrivateKey);
        
        console.log('decoded data authentication',decodedToken);

        request.user = decodedToken;
        next();
    }
    catch(err){

         let errorMessage;
            /* beautify preserve:start */
            if (!err.statusCode) { errorMessage = { statusCode: 400, message: err }} 
            else { errorMessage = err;}
            /* beautify preserve:end */

            response.status(errorMessage.statusCode).send(JSON.stringify(errorMessage));
    }


}