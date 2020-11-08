require('dotenv/config');
const express = require("express");
const db = require("./app/db");
const bodyParser = require("body-parser");
const app = express();
const UserRouter = require("./app/Routes/user.route");
const AdminRouter = require("./app/Routes/admin.route");
const ProductRouter = require("./app/Routes/product.route");
const CategoryRouter = require("./app/Routes/category.route");
const cors = require("cors");
const upload = require("./multer");

app.use(cors({
    origin: "http://localhost:3000",
}));
app.use(bodyParser.json());



app.use("/api/", UserRouter);
app.use("/api/admin/", AdminRouter);
app.use("/api/products/", ProductRouter);
app.use("/api/category/", CategoryRouter);

app.get("/", (req, res) => {
    res.send("hii");
})

app.listen(8000, () => { 
    console.log("Server Started")
});