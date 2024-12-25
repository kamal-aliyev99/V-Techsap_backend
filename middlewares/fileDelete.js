const fs = require("fs");
const path = require("path");

function fileDelete (filePathURL) {
    const filePath = path.resolve(`public/${filePathURL.split("/public/")[1]}`)
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (error) => {
            if (error) {
                console.log({
                    message: `File couldn't delete: '${filePath}'`,
                    error
                });
            } else {
                console.log(`file successfully deleted: '${filePath}'`);
            }
        })
    } else {
        console.log(`'${filePath}' file is not exist`);
    }
}

module.exports = fileDelete