module.exports = (req, res, next) => {
    if (req.params.id == req.body.id) {
        next();
    } else {
        next({
            statusCode: 400,
            message: "Params ID and Body ID are difference"
        })
    }
}