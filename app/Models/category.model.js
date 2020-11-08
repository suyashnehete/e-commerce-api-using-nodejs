const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

var Category = new Schema({
    id: ObjectId,
    name: {type: String, unique: true },
});

Category.plugin(mongoosePaginate);

Category.method('transform', function() {
    var obj = this.toObject();
 
    //Rename fields
    obj.id = obj._id;
    delete obj._id;
 
    return obj;
});


module.exports = mongoose.model("Categorys", Category);

