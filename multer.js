var fs = require('fs'); 
var multer = require('multer'); 
  
var storage = multer.memoryStorage({ 
    destination: (req, file, cb) => { 
        cb(null, 'uploads') 
    }
}); 
  
module.exports = multer({ storage: storage }); 