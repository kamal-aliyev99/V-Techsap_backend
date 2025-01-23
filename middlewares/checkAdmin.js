function checkAdmin (req, res, next) {
    // next();
    // return;

    const {role} = {...req.user};

    if (role == 0) {
        next();
        return;
    } else if (role == 1) {
        next({
            statusCode: 403,
            message: "Forbidden: Access denied",
        })
        return;
    } else {
        next({
            statusCode: 500,
            message: "Internal Server Error: role not found",
        })
        return;
    }
}

module.exports = checkAdmin