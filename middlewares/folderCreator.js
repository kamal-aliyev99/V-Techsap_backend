const fs = require("fs");
const path = require("path");

function folderCreator (folderName) {
    const fullDirName = path.join(__dirname, `../public/${folderName}`);

    if (!fs.existsSync(fullDirName)) {
        fs.mkdirSync(fullDirName, {recursive: true});
        console.log(`'${fullDirName}' folder created `); 
    }   
}

module.exports = folderCreator