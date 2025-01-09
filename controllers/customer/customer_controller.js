const customerModel = require("../../models/customer/customer_model");
const fileDelete = require("../../middlewares/fileDelete");

const Joi = require("joi");
const path = require("path");

const customerInsertSchema = Joi.object({
    title: Joi.string().max(255),
    image: Joi.string().allow(null),
    showHomePage: Joi.boolean().valid(true, false)
})

const customerUpdateSchema = customerInsertSchema.concat(
    Joi.object({
        id: Joi.number().positive().required()
    })
);

module.exports = {
    getCustomers,
    getHomePageCustomers,
    getCustomerByID,
    addCustomer,
    updateCustomer,
    deleteCustomer
}


//      G E T    A L L    C U S T O M E R S

function getCustomers (req, res, next) {
    customerModel.getCustomers()  
        .then(data => {
            res.status(200).json(data);
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




//      G E T    C U S T O M E R S   at  HomePage

function getHomePageCustomers (req, res, next) {
    const limitParam = req.query.limit; 
    const limit = !isNaN(+limitParam) && limitParam > 0 ? +limitParam : null

    customerModel.getHomePageCustomers(limit)
        .then(data => {
            res.status(200).json(data);
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




//      G E T    C U S T O M E R   b y   I D

function getCustomerByID (req, res, next) {
    const {id} = req.params;

    customerModel.getCustomerByID(id)
        .then(data => {
            if (data) {
                res.status(200).json(data);
            } else {
                next(
                    {
                        statusCode: 404,
                        message: "The customer Not Found",
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




//      A D D    C U S T O M E R

function addCustomer (req, res, next) {   
    const formData = {...req.body};
    const file = req.file;
    const filePath = file ? 
    `${req.protocol}://${req.get('host')}/${path.posix.join(...file.path.split(path.sep))}` 
    : null;
    const newCustomer = {
        ...formData,    
        image: filePath
    } 
    
    const {error} = customerInsertSchema.validate(newCustomer, {abortEarly: false})    
    
    if (error) {
        filePath && fileDelete(filePath);  // insert ugurlu olmasa sekil yuklenmesin,, silsin
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
        customerModel.addCustomer(newCustomer)
            .then(addedCustomer => {
                res.status(201).json({
                    message: "Customer successfully inserted",
                    data: addedCustomer
                });
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "An error occurred while adding customer",
                    error
                })
            })
    }
}




//      U P D A T E    C U S T O M E R      

function updateCustomer (req, res, next) {
    const {id} = req.params;
    const formData = {...req.body};

    if (formData.image === "null") {
        formData.image = null;
    }

    const file = req.file;
    const filePath = file ? 
    `${req.protocol}://${req.get('host')}/${path.posix.join(...file.path.split(path.sep))}` 
    : null;

    let editData;

    if (filePath) {
        editData = {...formData, image: filePath}
    } else {
        editData = {...formData}; 
        if (formData.image !== null) {
            Reflect.deleteProperty(editData, "image");
        }
    }    
    
    const {error} = customerUpdateSchema.validate(editData, {abortEarly: false})   

    if (error) {
        filePath && fileDelete(filePath);
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
        customerModel.getCustomerByID(id)
            .then(data => {
                if (data) {
                    customerModel.updateCustomer(id, editData)
                        .then(updatedData => {                            
                            Reflect.has(editData, "image") && data.image &&
                            fileDelete(data.image);

                            res.status(200).json({ message: "Customer updated successfully", data: updatedData });
                        })
                        .catch(error => {
                            filePath && fileDelete(filePath);
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating customer",
                                error
                            })
                        })
                } else {
                    filePath && fileDelete(filePath);
                    next({
                        statusCode: 404,
                        message: "The customer not found"
                    })
                }
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating customer",
                    error
                })
            })
    }
}




//      D E L E T E    C U S T O M E R

function deleteCustomer (req, res, next) {
    const {id} = req.params;
    let imagePath;

    customerModel.getCustomerByID(id)
        .then(data => {
            if (data) {                
                imagePath = data.image || null;

                customerModel.deleteCustomer(id)
                    .then((deletedCount) => {                        
                        if (deletedCount) {
                            imagePath && fileDelete(imagePath);
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting customer"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            message: "Internal Server Error: Unexpected occurred while deleting customer",
                            error
                        })
                    })

            } else {
                next({
                    statusCode: 404,
                    message: "The customer not found"
                })
            }
        })
        .catch(error => {
            next({
                statusCode: 500,
                message: "Internal Server Error: Unexpected occurred while deleting customer",
                error
            })
        })
}
