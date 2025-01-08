const fileDelete = require("./fileDelete");
const path = require("path");

module.exports = (req, res, next) => {
    const file = req.file;
    const filePath = file ? 
    `${req.protocol}://${req.get('host')}/${path.posix.join(...file.path.split(path.sep))}` 
    : null;

    if (req.params.id == req.body.id) {
        next();
    } else {
        filePath && fileDelete(filePath);
        next({
            statusCode: 400,
            message: "Params ID and Body ID are difference"
        })
    }
}