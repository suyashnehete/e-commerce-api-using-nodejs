const express = require("express");
const Admin = require("../Models/admin.model");
const User = require("../Models/user.model");
const bcrypt = require("bcrypt");
const cors = require("cors");

const router = express.Router();

router.post("/login", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    if (password.length > 5) {
        Admin.exists({ email: email }, (err, isAvailable) => {
            if (!err) {
                if (isAvailable) {
                    Admin.findOne({ "email": email }, (err, doc) => {
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

router.get("/register", (req, res) => {
    Admin.findOne({ isAdmin: true }, (err, isAvailable) => { 
        if (isAvailable) {
            res.send("Admin Already Registered");
        } else {
            bcrypt.hash("admin", 10, (err, str) => {
                var admin = new Admin();
                admin.name = "admin";
                admin.password = str;
                admin.email = "admin@admin.com"
                admin.save((err, doc) => {
                    if (!err) {
                        res.send("name: admin\nemail: admin@admin.com\nPassword: admin");
                    } else {
                        res.send("Some error occured, try after some time")
                    }
                });
            });
        }
    });
});

router.get("/users", (req, res) => {
    const filter = JSON.parse(req.query.filter) || {};
    const limit = req.query.range ? (JSON.parse(req.query.range)[1] - JSON.parse(req.query.range)[0] + 1) : 10;
    const page = req.query.range ? Math.ceil((JSON.parse(req.query.range)[1] / limit)) : 1;
    const sortId = req.query.sort ? JSON.parse(req.query.sort)[0] : "id"
    const sortValue = req.query.sort ? JSON.parse(req.query.sort)[1] : "ASC"


    var options = {
        sort:     { name: sortValue === "ASC" ? 1 : -1 },
        page:   page,
        limit:    limit
    };
    console.log({ sortId: sortValue === "ASC" ? 1 : -1 })
    User.paginate({}, options, (err, result) => {
        if (!err) {
            let users = [];
            for (let i = 0; i < result.docs.length; i++) {
                users.push(result.docs[i].transform());
            }
            res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
            res.setHeader("Access-Control-Expose-Headers", "Content-Range");
            res.setHeader("Content-Range", `items ${result.limit*page-limit+1}-${result.limit*page}/${result.totalDocs}`);
            res.send(users);
        } else {
            console.log(err.message)
        }
    });

});

module.exports = router;