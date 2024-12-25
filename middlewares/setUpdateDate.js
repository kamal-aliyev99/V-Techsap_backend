module.exports = (req, res, next) => {
    if (["PUT", "PATCH"].includes(req.method)) {
        req.body.updated_at = new Date();
    }
    next();
};