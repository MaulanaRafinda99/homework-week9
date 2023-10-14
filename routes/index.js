// Router
const express = require("express");
const router = express.Router();
const {User, Film} = require("../models");
const db = require("../models/index.js");
const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
const jwt = require("jsonwebtoken");
const SECRET_KEY = "kucing"
const {authentication, authorization} = require('../middlewares/auth.js')
const films = db.db_movies;
// Tabel User 

// ---> Fitur register untuk user baru
// Parameter next digunakan untuk keperluan error handling.
router.post('/register', async(req, res, next) => {
    // Menerima input data email, username & password 
    const {email, username, password} = req.body;
    
    // Password yang diinput akan dihash menggunakan bcrypt
    const hashPassword = bcrypt.hashSync(password, salt);

    const createdUser = await User.create ({
        email,
        username,
        password: hashPassword
    }, { returning: true})
    res.status(201).json(createdUser)
})

// ---> Fitur Login User :
router.post('/login', async(req, res, next) => {
    try {
        const {email, password} = req.body;

        // 1. Cari user dalam database
        const foundUser = await User.findOne({
            where: {
                email
            }
        })

        if (foundUser) {
        // 2. Check password 
            const comparePassword = bcrypt.compareSync(password, foundUser.password)

            if (comparePassword) {

                // Generate token menggunakan jsonwebtoken
                const accessToken = jwt.sign({
                    email: foundUser.email,
                    username: foundUser.username,
                }, SECRET_KEY)
                res.status(200).json({
                    message: "Login Succesfully",
                    email: foundUser.email,
                    username: foundUser.username,
                    accessToken
                })
            } else {
                throw {name: "InvalidCredentials"}

            }
        } else {
            throw {name: "InvalidCredentials"}
        }
    } catch (err) {
        // Masuk ke middleware selanjutnya
        next(err)
    }
})

router.use(authentication)

// Tabel Film   
router.post('/films', async (req, res, next) => {
    try {
        const {title, genre, year} = req.body;
        const {id} = req.loggedUser;
       
        const film = await Film.create({
            title,
            genre,
            year,
            user_id: id
        }, {returning: true})

        res.status(201).json({
            message: "Film created Succesfully",
            data: film
        })
    } catch (err) {
        next(err)
    }
})

// Daftar semua films
router.get('/films', async (req, res, next) => {
    try {
        const films = await Film.findAll()

        res.status(200).json(films)
    } catch (err) {
        next(err)
    }
})



// GET Films detail by ID
router.get('/films/:id', async(req, res, next) => {
    try {
        const {id} = req.params;

        const foundFilm = await Film.findOne({
            where: {
                id
            },
            include: {
                model: User
            }
        })

        if(foundFilm) {
            res.status(200).json(foundFilm);
        } else {
            throw {name: "ErrorNotFound" }
        }
    } catch (err) {
        next (err)
    }
})

// Update Film by ID
// Tidak bisa update atau delete film milik orang lain.
router.put('/films/:id', authorization, async(req, res, next) => {
    try {
        const {id} = req.params;
        const {title, genre, year} = req.body;

        const foundFilm = await Film.findOne({
            where: {
                id
            }
        })

        if (foundFilm) {
            const updateFilm  = await foundFilm.update({
                title: title || foundFilm.title,
                genre: genre || foundFilm.genre,
                year: year || foundFilm.year
            }, {returning: true})

            res.status(200).json({
                message: "Film Updated Succesfully",
                data: updateFilm
            })
        } else {
            throw { name: "ErrorNotFound" }
        }
    } catch (err) {
        next(err);
    }
})

// Delete Film by user_id
router.delete('/films/:id', authorization, async(req, res, next) => {
    try {
        const {id} = req.params;

        const foundFilm = await Film.findOne({
            where: {
                id
            }
        })
        if (foundFilm) {
            await foundFilm.destroy();

            res.status(200).json({
                message: "Film Deleted Succesfully"
            })
        } else {
            throw {name: "ErrorNotFound" }
        }
    } catch (err) {
        next(err)   
    }
})
 

// Menampilkan data dengan menggunakan pagination
router.get('/films/paginate', paginateResults(films), (req, res) => {
    res.json(res.paginateResults);
})

function paginateResults(model) {
    // Middleware function :
    return (req, res, next) => {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        // Menghitung/menentukan index awal sampai dengan index akhir
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const results = {};
        if (endIndex < model.length) {
            results.next = {
                page: page + 1,
                limit: limit
            };
        }

        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit
            };
        }

        results.results = model.slice(startIndex, endIndex);

        res.paginateResults = results;
        next();
    };
}



module.exports = router;