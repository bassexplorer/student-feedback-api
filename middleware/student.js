module.exports = (request,response,next) =>{
    if(request.user.role.roleName == 'student' || request.user.role.roleName == 'admin'){
        next();
    } else {
    let errorMessage = {
        statusCode: 401,
        message: 'Access Denied: unathorised.'
    }
        response.status(401).send(JSON.stringify(errorMessage))
    }
}