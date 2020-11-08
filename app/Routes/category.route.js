const express = require("express");
const Category = require("../Models/category.model");
const router = express.Router();


router.get("/", (req, res) => {
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    const limit = req.query.range ? (JSON.parse(req.query.range)[1] - JSON.parse(req.query.range)[0] + 1) : 10;
    const page = req.query.range ? Math.ceil((JSON.parse(req.query.range)[1] / limit)) : 1;
    const sortId = req.query.sort ? JSON.parse(req.query.sort)[0] : "id"
    const sortValue = req.query.sort ? JSON.parse(req.query.sort)[1] : "ASC"

    var options = {
        sort:     sortId === "id" ? { id: sortValue === "ASC" ? 1 : -1 } : { name: sortValue === "ASC" ? 1 : -1 },
        page:   page,
        limit:    limit
    };
    Category.paginate(filter, options, (err, result) => {
        if (!err) {
            let categorys = [];
            for (let i = 0; i < result.docs.length; i++) {
                categorys.push(result.docs[i].transform());
            }
            res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
            res.setHeader("Access-Control-Expose-Headers", "Content-Range");
            res.setHeader("Content-Range", `items ${result.limit*page-limit+1}-${result.limit*page}/${result.totalDocs}`);
            res.send(categorys);
        } else {
            console.log(err.message)
        }
    });
});

router.post("/", (req, res) => {

            var name = req.body.name; 
            var category = new Category();
            category.name = name;
            category.save((err, doc) => {
                if (!err) {
                    res.send({id: doc._id, name: doc.name});
                } else {
                    res.status(422).send({error: "Category Already Exists"});
                }
            });
});

router.put("/:id", (req, res) => {
    var id = req.params.id;
    var name = req.body.name;

    Category.findByIdAndUpdate(id, { name: name }, (err, doc) => {
        if (!err) {
            res.send({ id: doc._id, name: doc.name });
        } else {
            console.log(err.message);
        }
    });

});

router.get("/:id", (req, res) => {
    var id = req.params.id;
    Category.findById(id, (err, doc) => {
        if (!err) {
            res.send({ id: doc._id, name: doc.name });
        } else {
            console.log(err.message)
        }
    })
})

module.exports = router;