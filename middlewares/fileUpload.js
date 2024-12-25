const path = require("path");
const crypto = require("crypto");
const folderCreator = require("./folderCreator");
const multer = require("multer");

function fileUpload (folderName) { // hansi folderde olacagi 
    folderCreator(folderName);   // middleware ile public folderi icinde [folderName] yoxdursa yaradacag  

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, `public/${folderName}/`) 
        },
        filename: (req, file, cb) => {
            const uniqueName = crypto.randomBytes(16).toString("hex"); // 32 symbol random name
            const ext = path.extname(file.originalname); // file formati
            
            cb(null, `${uniqueName}${ext}`)
        }
    })

    return multer({storage})
}

module.exports = fileUpload


