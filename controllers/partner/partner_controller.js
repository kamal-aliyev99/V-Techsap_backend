const partnerModel = require("../../models/partner/partner_model");
const fileDelete = require("../../middlewares/fileDelete");

const Joi = require("joi");
const path = require("path");

const partnerInsertSchema = Joi.object({
    title: Joi.string().max(255),
    image: Joi.string().allow(null)
})

const partnerUpdateSchema = partnerInsertSchema.concat(
    Joi.object({
        id: Joi.number().positive().required()
    })
);

module.exports = {
    getPartners,
    getStaticImageByID,
    addPartner,
    updatePartner,
    deletePartner
}


//      G E T    A L L    P A R T N E R S

function getPartners (req, res, next) {
    partnerModel.getPartners()  
        .then(partners => {
            res.status(200).json(partners);
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




//      G E T    P A R T N E R   b y   I D

function getStaticImageByID (req, res, next) {
    const {id} = req.params;

    partnerModel.getPartnerByID(id)
        .then(partner => {
            if (partner) {
                res.status(200).json(partner);
            } else {
                next(
                    {
                        statusCode: 404,
                        message: "The partner Not Found",
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




//      A D D    P A R T N E R

function addPartner (req, res, next) {   
    const formData = {...req.body};
    const file = req.file;
    const filePath = file ? 
    `${req.protocol}://${req.get('host')}/${path.posix.join(...file.path.split(path.sep))}` 
    : null;
    const newPartner = {
        ...formData,    
        image: filePath
    } 
    
    const {error} = partnerInsertSchema.validate(newPartner, {abortEarly: false})    
    
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
        partnerModel.addPartner(newPartner)
            .then(addedPartner => {
                res.status(201).json({
                    message: "Partner successfully inserted",
                    data: addedPartner
                });
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "An error occurred while adding partner",
                    error
                })
            })
    }
}




//      U P D A T E    P A R T N E R      

function updatePartner (req, res, next) {
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
    
    const {error} = partnerUpdateSchema.validate(editData, {abortEarly: false})   

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
        partnerModel.getPartnerByID(id)
            .then(data => {
                if (data) {
                    partnerModel.updatePartner(id, editData)
                        .then(updatedData => {                            
                            Reflect.has(editData, "image") && data.image &&
                            fileDelete(data.image);

                            res.status(200).json({ message: "Partner updated successfully", data: updatedData });
                        })
                        .catch(error => {
                            filePath && fileDelete(filePath);
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating partner",
                                error
                            })
                        })
                } else {
                    filePath && fileDelete(filePath);
                    next({
                        statusCode: 404,
                        message: "The partner not found"
                    })
                }
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating partner",
                    error
                })
            })
    }
}




//      D E L E T E    P A R T N E R

function deletePartner (req, res, next) {
    const {id} = req.params;
    let imagePath;

    partnerModel.getPartnerByID(id)
        .then(data => {
            if (data) {                
                imagePath = data.image || null;

                partnerModel.deletePartner(id)
                    .then((deletedCount) => {                        
                        if (deletedCount) {
                            imagePath && fileDelete(imagePath);
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting partner"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            message: "Internal Server Error: Unexpected occurred while deleting partner",
                            error
                        })
                    })

            } else {
                next({
                    statusCode: 404,
                    message: "The partner not found"
                })
            }
        })
        .catch(error => {
            next({
                statusCode: 500,
                message: "Internal Server Error: Unexpected occurred while deleting partner",
                error
            })
        })
}
