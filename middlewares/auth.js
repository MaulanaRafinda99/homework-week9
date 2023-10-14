const jwt = require('jsonwebtoken');
const SECRET_KEY = "kucing";
const {User, Film} = require('../models')

// Mengecek apakah user sudah login atau belum
const authentication = async (req, res, next) => {
    try {
        // Verify token dengan jwt
        if(!req.headers.authorization) {
            throw { name: "Unauthenticated" }
        }
        const token = req.headers.authorization.split(" ")[1];
        
        // Decode token menggunakan jwt.verify
        const decode = jwt.verify(token, SECRET_KEY);

        const foundUser = await User.findOne({ 
            where: {
                email: decode.email
            }
        }) 

        if (foundUser) {
            // Buat costum property di request

            req.loggedUser  = {
                id: foundUser.id,
                email: foundUser.email,
                username: foundUser.username
            }
            
            // Masuk ke middleware selanjutnya
            next()
        }else {
            throw{name: "Unauthenticated"}
        }
    } catch (err) {
        
        next (err)
    }
}

// Pengecekan setelah login
const authorization = async (req, res, next) => {
    try {
        // Film ID
        const {id} = req.params;

        const foundFilm = await Film.findOne({
            where: {
                id
            }
        })
        
        if(foundFilm) { 

            const loggedUser = req.loggedUser;
            if(foundFilm.user_id === loggedUser.id) {
                next()
            } else {
                throw{name: "Unauthorized"}
            }
        } else {
            throw { name: "ErrorNotFound" }
        }
    } catch (err) {
        next(err)   
    }
}

module.exports = {
    authentication,
    authorization
}