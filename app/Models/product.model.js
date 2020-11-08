const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

var Product = new Schema({
    id: ObjectId,
    name: {type: String },
    category: {type: String },
    price: { type: Number },
    stock: { type: Number },
    description: {type: String },
    image: { type: String } 
});

Product.plugin(mongoosePaginate);

Product.method('transform', function() {
    var obj = this.toObject();
 
    //Rename fields
    obj.id = obj._id;
    delete obj._id;
 
    return obj;
});


module.exports = mongoose.model("Products", Product);

