const userModel = require("../../models/user/user_model");

const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerSchema = Joi.object({
    fullName: Joi.string().max(255).required(),
    username: Joi.string()
        .pattern(/^\S+$/)  // bosluq olmamalidir
        .min(3).max(255)
        .required()
        .messages({
            'string.pattern.base': 'The username must not contain spaces.',
        }),
    email: Joi.string().max(255).required(),
    password: Joi.string()
        .pattern(/^(?!.*\s)(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/) // min 8, en az - 1 boyuk, 1 kicik herf, 1 reqem, bosluqsuz
        .max(255)
        .required()
        .messages({  
            'string.pattern.base': 'The password must be at least 8 characters long, include 1 uppercase letter, 1 lowercase letter, and 1 number, and must not contain spaces.',
            'string.max': 'The password must not exceed 255 characters.',
            'string.empty': 'The password field cannot be empty.'
        })
})

const loginSchema = Joi.object({
    login: Joi.string().max(255).required(),
    password: Joi.string().max(255).required()
})

// const userUpdateSchema = Joi.object({
//     id: Joi.number().positive().required(),
//     update_at: Joi.date(),
//     fullName: Joi.string().max(255),
//     email: Joi.string().max(255),

// })

module.exports = {
    // getUsers,
    // getUserByID,
    loginUser,
    registerUser,
    logoutUser,
    checkLogin
}


//      G E T    A L L    U S E R

// function getUsers (req, res, next) {
//     userModel.getUsers()  
//         .then(users => {
//             res.status(200).json(users);
//         })
//         .catch(error => {
//             next({
//                 statusCode: 500,
//                 message: "Internal Server Error",
//                 error
//             })
//         })
// }




//      G E T    U S E R   b y   ID

// function getUserbyID (req, res, next) {
//     const {id} = req.params;

//     contactBaseModel.getContactBaseByID(id)
//         .then(contactBase => {
//             if (contactBase) {
//                 res.status(200).json(contactBase);
//             } else {
//                 next(
//                     {
//                         statusCode: 404,
//                         message: "The contactBase Not Found",
//                     }
//                 )
//             }
//         })
//         .catch(error => {
//             next(
//                 {
//                     statusCode: 500,
//                     message: "Internal Server Error",
//                     error
//                 }
//             )
//         })
// }




//      L O G I N    U S E R    username | email  &  password

function loginUser (req, res, next) {
    const loginData = {...req.body};    

    const {error} = loginSchema.validate(loginData, {abortEarly: false})    
    
    if (error) {
        const errors = error.details.map(err => ({  // error sebebi
            field: err.context.key,
            message: err.message
        }));

        next({
            statusCode: 400,
            message: "Bad Request: The server could not understand the request because of invalid syntax.",
            errors
        })  
        
    } else {
        userModel.checkLoginData(loginData.login)
            .then(async data => {
                if (data) {
                    const isPasswordValid = await bcrypt.compare(loginData.password, data.password_hash);

                    if (isPasswordValid) {                        
                        userModel.getUserByID(data.id)
                            .then(user => {                          
                                const accessToken = jwt.sign(user, process.env.JWT_ACCESS_SECRET, { expiresIn: "1h" }); 
                                const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: "2d" }); 

                                res.cookie("accessToken", accessToken, {
                                    httpOnly: true,          //  XSS'e qarsi
                                    // secure: true,         //  https
                                    // sameSite: "strict",   //  ancag eyni domein'den gelen sorgular (CSRF'e qarsi)
                                    maxAge: 60 * 60 * 1000   //  1 saat
                                });
                                
                            
                                res.cookie("refreshToken", refreshToken, {
                                    httpOnly: true,
                                    // secure: true,
                                    // sameSite: "strict",
                                    maxAge: 2 * 24 * 60 * 60 * 1000   // 2 gün
                                });

                                res.status(200).json(user)
                            })
                    } else {
                        next({
                            statusCode: 401,
                            message: "Login unsuccessfuly. Invalid password.",
                        })
                    }
                    
                } else {
                    next({
                        statusCode: 404,
                        message: "User Not Found",
                    })
                }
                    
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Internal Server Error",
                    error
                })
            })
    }
}
// const exampleLoginData ={
//     login: "test@gmail.com",  // username or email
//     password: "12345"
// }




//      R E G I S T E R 

async function registerUser (req, res, next) {   
    const {password, ...userData} = req.body;   
    
    const {error} = registerSchema.validate(req.body, {abortEarly: false})    
    
    if (error) {
        const errors = error.details.map(err => ({  // error sebebi
            field: err.context.key,
            message: err.message
        }));

        next({
            statusCode: 400,
            message: "Bad Request: The server could not understand the request because of invalid syntax.",
            // errors     // dont send for security
        })  
        
    } else {        
        userModel.checkExistUsernameOrEmail(userData.username, userData.email)
            .then( data => {
                if (data?.username == userData.username) {
                    next({
                        statusCode: 409,  
                        message: `'${userData.username}' username already exist`
                    })
                } else if (data?.email == userData.email) {
                    next({
                        statusCode: 409,  
                        message: `'${userData.email}' email already exist`
                    })
                } else {
                    // Password Hash
                    const saltRounds = 10;

                    bcrypt.hash(password, saltRounds)
                        .then( hashedPassword => {
                            userData.password_hash = hashedPassword;

                            userModel.registerUser(userData)
                                .then(addedUser => {
                                    res.status(201).json({
                                        message: "User registration successfully",
                                        data: addedUser
                                    });
                                })
                                .catch(error => {
                                    next({
                                        statusCode: 500,
                                        message: "An error occurred while registration",
                                        error
                                    })
                                })

                        })
                }
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Unexpected occurred while registration",
                    error
                })
            })            
    }
}

// const exampleAddUser = {
//     fullName: "Kamal Aliyev",
//     username: "+994557895623",
//     email: "test@mail.com",
//     password: "Lorem Ipsum"
// }



function logoutUser (req, res, next) {
    res.clearCookie("accessToken", {
        httpOnly: true, 
        // secure: true, 
        // sameSite: "strict"
    });
    res.clearCookie("refreshToken", {
        httpOnly: true, 
        // secure: true, 
        // sameSite: "strict"
    });

    res.status(200).json({ message: "Logged out successfully" });
}


function checkLogin (req, res, next) {
    const { iat, exp, ...user} = req.user;
    

    res.status(200).json(user);
}