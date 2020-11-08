const express = require("express");
const User = require("../Models/user.model");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/login", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    if (password.length > 5) {
        User.exists({ email: email }, (err, isAvailable) => {
            if (!err) {
                if (isAvailable) {
                    User.findOne({ "email": email }, (err, doc) => {
                        if (!err) {
                            bcrypt.compare(password, doc.password, (err, isSame) => {
                                if (!err) {
                                    if (isSame) {
                                        res.send({ data: doc })
                                    } else {
                                        res.send({ error: "Invalid Password" })
                                    }
                                } else {
                                    res.send({ error: err.message })
                                }
                            });
                        } else {
                            res.send({ error: err.message })
                        }
                    });
                } else {
                    res.send({ error: "Email is not registered" })
                }
            } else {
                res.send({ error: err.message })
            }
        });
    } else {
        res.send({ error: "Password length should be greater than 5" })
    }
});

router.post("/register", (req, res) => { 
    console.log(req);
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    if (password.length > 5) {
        bcrypt.hash(password, 10, (err, encrypted) => {
            if (!err) {
                var user = new User();
                user.name = name;
                user.password = encrypted;
                user.email = email;
                user.save((err, doc) => {
                    if (!err) {
                        res.send({ data: doc })
                    } else {
                        res.send({ error: "Email Already Exists" });
                    }
                });
            } else {
                res.send({ error: "Some Error Occured, Try after some time" });
            }
        });
    } else {
        res.send({ error: "Password length should be greater than 5" });
    }
});



module.exports = router;