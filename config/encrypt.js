const crypt = {
    saltRounds: parseInt(process.env.CRIPT_SALT_ROUNDS),
    jwtPrivateKey: process.env.JWT_PRIVATE_KEY
}

module.exports = crypt;