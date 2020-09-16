module.exports = (reqest,response,next) =>{
    response.setHeader('Content-Type', 'application/json');
    next();
}