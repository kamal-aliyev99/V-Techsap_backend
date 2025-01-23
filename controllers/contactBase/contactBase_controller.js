const contactBaseModel = require("../../models/contactBase/contactBase_model");
const fileDelete = require("../../middlewares/fileDelete");

const Joi = require("joi");
const path = require("path");

const contactBaseInsertSchema = Joi.object({
    name: Joi.string().max(255).required(),
    surname: Joi.string().max(255).required(),
    phone: Joi.string().max(255).required(),
    email: Joi.string().max(255).required(),
    message: Joi.string().required(),
})

const contactBaseUpdateSchema = Joi.object({
    id: Joi.number().positive().required(),
    isRead: Joi.boolean().required(),
    
    // created_at: Joi.date().optional(),
    // name: Joi.string().max(255),
    // surname: Joi.string().max(255),
    // phone: Joi.string().max(255),
    // email: Joi.string().max(255),
    // message: Joi.string(),
})

module.exports = {
    getContactBase,
    getContactBaseByID,
    addContactBase,
    updateIsReadContactBase,
    deleteContactBase
}


//      G E T    A L L    contactBase

function getContactBase (req, res, next) {
    contactBaseModel.getContactBase()  
        .then(contactBase => {
            res.status(200).json(contactBase);
        })
        .catch(error => {
            next({
                statusCode: 500,
                message: "Internal Server Error",
                error
            })
        })
}




//      G E T    contactBase   b y   I D

function getContactBaseByID (req, res, next) {
    const {id} = req.params;

    contactBaseModel.getContactBaseByID(id)
        .then(contactBase => {
            if (contactBase) {
                res.status(200).json(contactBase);
            } else {
                next(
                    {
                        statusCode: 404,
                        message: "The contactBase Not Found",
                    }
                )
            }
        })
        .catch(error => {
            next(
                {
                    statusCode: 500,
                    message: "Internal Server Error",
                    error
                }
            )
        })
}




//      A D D    contactBase

function addContactBase (req, res, next) {   
    const formData = req.body;   
    
    const {error} = contactBaseInsertSchema.validate(formData, {abortEarly: false})    
    
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
        contactBaseModel.addContactBase(formData)
            .then(addedContactBase => {
                res.status(201).json({
                    message: "Form successfully submited",
                    data: addedContactBase
                });
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "An error occurred while submited form",
                    error
                })
            })
    }
}
// const addForm = {
//     name: "Kamal",
//     surname: "Aliyev",
//     phone: "+994557895623",
//     email: "test@mail.com",
//     message: "Lorem Ipsum",
// }




//      U P D A T E    contactBase

function updateIsReadContactBase (req, res, next) {
    const {id} = req.params;
    const isRead = req.body.isRead;
    const formData = {...req.body};   

    const {error} = contactBaseUpdateSchema.validate(formData, {abortEarly: false})   

    if (error) {
        const errors = error.details.map(err => ({ 
            field: err.context.key,
            message: err.message
        }));

        next({
            statusCode: 400,
            message: "Bad Request: The server could not understand the request because of invalid syntax.",
            errors
        })  
        
    } else {
        contactBaseModel.getContactBaseByID(id)
            .then(data => {
                if (data) {
                    contactBaseModel.updateIsReadContactBase(id, isRead)
                        .then(updatedData => {
                            res.status(200).json({ message: "Message marked as unread", data: updatedData });
                        })
                        .catch(error => {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating contactBase",
                                error
                            })
                        })
                } else {
                    next({
                        statusCode: 404,
                        message: "The contactBase not found"
                    })
                }
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating contactBase",
                    error
                })
            })
    }
}
// const updateForm = {
//     id: 1,
//     name: "Kamal",
//     surname: "Aliyev",
//     phone: "+994557895623",
//     email: "test@mail.com",
//     message: "Lorem Ipsum",
//     created_at: "2024-11-20"   // ISO format
// }



//      D E L E T E    contactBase

function deleteContactBase (req, res, next) {
    const {id} = req.params;

    contactBaseModel.getContactBaseByID(id)
        .then(data => {
            if (data) {
                contactBaseModel.deleteContactBase(id)
                    .then(deletedCount => {
                        if (deletedCount) {
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting Form from contactBase"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            message: "Internal Server Error: Unexpected occurred while deleting Form from contactBase",
                            error
                        })
                    })

            } else {
                next({
                    statusCode: 404,
                    message: "The form not found"
                })
            }
        })
}