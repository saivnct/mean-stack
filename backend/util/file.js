const fs = require('fs');
const path = require("path");

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err){
      console.log(err);
    }
  })
}

const deleteImage = (imageName) => {
  const filePath = path.join(__dirname,'..', 'images', imageName);
  console.log('delete Image filePath:',filePath);

  fs.unlink(filePath, (err) => {
    if (err){
      console.log(err);
    }
  })
}

exports.deleteFile = deleteFile;
exports.deleteImage = deleteImage;
