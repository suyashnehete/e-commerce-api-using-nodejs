const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

var User = new Schema({
    id: ObjectId,
    name: {type: String},
    email: { type: String, unique: true },
    password: { type: String },
});

User.plugin(mongoosePaginate);

User.method('transform', function() {
    var obj = this.toObject();
 
    //Rename fields
    obj.id = obj._id;
    delete obj._id;
 
    return obj;
});


module.exports = mongoose.model("Users", User);

