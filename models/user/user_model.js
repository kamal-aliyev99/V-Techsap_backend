const db = require("../../config/db-config");

module.exports = {
    // getUsers,
    getUserByID,
    checkExistUsernameOrEmail,
    checkLoginData,
    // loginUser,
    registerUser,
}

// function getUsers () {
//     return db("user")
//         .select(
//             "id",
//             "fullName",
//             "username",
//             "email",
//             "role",
//             "created_at",
//             "updated_at"
//         )
// }

function getUserByID (id) {
    return db("user")
        .where({id})
        .select(
            "id",
            "fullName",
            "username",
            "email",
            "role",         
            "created_at",
            "updated_at"
        )
        .first()
}

function checkExistUsernameOrEmail(username, email) {
    return db("user")
        .where({username})
        .orWhere({email})
        .select("username", "email")
        .first()
}

function checkLoginData(login) {
    return db("user")
        .where("username", login)
        .orWhere("email", login)
        .select("id", "password_hash")
        .first()
}

// function loginUser(loginData) {
//     return db("user")
//         .where("username", loginData.login)
//         .orWhere("email", loginData.login)
//         .andWhere("password_hash", loginData.password)
//         .select(
//             "id",              
//             "fullName",
//             "username",
//             "email",
//             "role",
//             "created_at",
//             "updated_at"
//         )
//         .first()
// }

function registerUser (newUser) { 
    return db("user")
        .insert(newUser)
        .returning(
            "fullName"
        )
        .then(([data]) => data)
}

