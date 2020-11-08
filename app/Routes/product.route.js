const express = require("express");
const Product = require("../Models/product.model");
const upload = require("../../multer");
const s3 = require("../../s3");
const router = express.Router();
const uuid = require("uuid");

router.get("/", (req, res) => {
    const filter = JSON.parse(req.query.filter) || {};
    const limit = req.query.range ? (JSON.parse(req.query.range)[1] - JSON.parse(req.query.range)[0] + 1) : 10;
    const page = req.query.range ? Math.ceil((JSON.parse(req.query.range)[1] / limit)) : 1;
    const sortId = req.query.sort ? JSON.parse(req.query.sort)[0] : "id"
    const sortValue = req.query.sort ? JSON.parse(req.query.sort)[1] : "ASC"

    var options = {
        sort:     sortId === "image" ? { image: sortValue === "ASC" ? 1 : -1 } : sortId === "id" ? { id: sortValue === "ASC" ? 1 : -1 }: sortId === "name" ? { name: sortValue === "ASC" ? 1 : -1 } : sortId === "category" ? { category: sortValue === "ASC" ? 1 : -1 } : sortId === "price" ? { price: sortValue === "ASC" ? 1 : -1 } : sortId === "stock" ? { stock: sortValue === "ASC" ? 1 : -1 } : { description: sortValue === "ASC" ? 1 : -1 },
        page:   page,
        limit:    limit
    };

    Product.paginate(filter, options, (err, result) => {
        if (!err) {
            let products = [];
            for (let i = 0; i < result.docs.length; i++) {
                products.push(result.docs[i].transform());
            }
            res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
            res.setHeader("Access-Control-Expose-Headers", "Content-Range");
            res.setHeader("Content-Range", `items ${result.limit*page-limit+1}-${result.limit*page}/${result.totalDocs}`);
            res.send(products);
        } else {
            console.log(err.message)
        }
    });
});

router.post("/", upload.single('image'), (req, res) => {
    let extension = req.file.originalname.split(".")[1];
    
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `products/${uuid.v4()}.${extension}`,
        Body: req.file.buffer
    }

    s3.upload(params, (err, data) => {
        if (!err) {
            var name = req.body.name; 
            var price = parseInt(req.body.price);
            var category = req.body.category;
            var stock = parseInt(req.body.stock);
            var description = req.body.description;
            var image = data.Location;  
            var product = new Product();
            product.name = name;
            product.price = price;
            product.category = category;
            product.stock = stock;
            product.image = image;
            product.description = description;
            product.save((err, doc) => {
                if (!err) {
                    res.send({ id: doc._id, image: doc.image, name: doc.name, price: doc.price, category: doc.category, stock: doc.stock, description: doc.description });
                } else {
                    console.log(err.message);
                }
            });
        } else {
            console.log(err.message);
        }
    });

});

router.put("/:id", (req, res) => {
    var id = req.params.id;
    var name = req.body.name;
    var category = req.body.category;
    var price = req.body.price;
    var stock = req.body.stock;
    var description = req.body.description;

    Product.findByIdAndUpdate(id, { name: name, category: category, price: price, stock: stock, description: description }, (err, doc) => {
        if (!err) {
            res.send({ id: doc._id, image: doc.image, name: doc.name, price: doc.price, category: doc.category, stock: doc.stock, description: doc.description });
        } else {
            console.log(err.message);
        }
    });

});

router.get("/:id", (req, res) => {
    var id = req.params.id;
    Product.findById(id, (err, doc) => {
        if (!err) {
            res.send({ id: doc._id, image: doc.image, name: doc.name, price: doc.price, category: doc.category, stock: doc.stock, description: doc.description });
        } else {
            console.log(err.message)
        }
    })
})

router.delete("/:id", (req, res) => { 
    var id = req.params.id;
    Product.findByIdAndDelete(id, (err, doc) => {
        if (!err) {
            var link = doc.image.split("/");
            console.log(link);
            var key = `${link[link.length - 2]}/${link[link.length - 1]}`;
            console.log(key);
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
            }
            s3.deleteObject(params, (err, data) => {
                if (!err) {
                    console.log(data);
                } else {
                    console.log(err);
                }
            })
        } else {
            console.log(err);
        }
    });
});

router.delete("/", (req, res) => {
    var filter = JSON.parse(req.query.filter).id;

    Product.deleteMany({_id : filter}, err => { 
        if (!err) {
            res.sendStatus(200);
        } else {
            res.sendStatus(401)
        }
    });

});

module.exports = router;