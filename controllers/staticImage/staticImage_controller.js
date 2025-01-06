const staticImageModel = require("../../models/staticImage/staticImage_model");
const fileDelete = require("../../middlewares/fileDelete");

const Joi = require("joi");
const path = require("path");

const staticImageInsertSchema = Joi.object({
    key: Joi.string().max(255).required(),
    image: Joi.string().allow(null)
})

const staticImageUpdateSchema = staticImageInsertSchema.concat(
    Joi.object({
        id: Joi.number().positive().required()
    })
);

const getDatasByArraySchema = Joi.array()
  .items(
    Joi.string().max(255).required() 
  )
  .min(1)
  .required();


module.exports = {
    getStaticImages,
    getStaticImageByKeyorID,
    getStaticImagesByKeysArray,
    addStaticImage,
    updateStaticImage,
    deleteStaticImage
}


//      G E T    A L L    S T A T I C   I M A G E S

function getStaticImages (req, res, next) {
    staticImageModel.getStaticImages()  
        .then(staticImages => {
            res.status(200).json(staticImages);
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




//      G E T    S T A T I C   I M A G E   b y   ID / Key 

function getStaticImageByKeyorID (req, res, next) {
    const {keyOrID} = req.params;

    const modelFunction = 
    isNaN(Number(keyOrID)) ?
    "getStaticImageByKey" :
    "getStaticImageByID" 

    staticImageModel[modelFunction](keyOrID)
        .then(staticImage => {
            if (staticImage) {
                res.status(200).json(staticImage);
            } else {
                next(
                    {
                        statusCode: 404,
                        message: "The staticImage Not Found",
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



//      G E T    S T A T I C   I M A G E s   b y   Keys (array)

function getStaticImagesByKeysArray (req, res, next) {
    const keysArr = req.body;
    
    const {error} = getDatasByArraySchema.validate(keysArr, {abortEarly: false})

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
        staticImageModel.getStaticImagesByKeysArray(keysArr)
        .then(datas => {
            if (datas.length) {
                const datasObject = datas.reduce((obj, item) => {
                    return {
                        ...obj,
                        [item.key]: item.image
                    }
                }, {})                
                res.status(200).json(datasObject);
            } else {
                next(
                    {
                        statusCode: 404,
                        message: "The datas Not Found",
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
}
//  NOTE::  arraydaki herhansi key DB'da yoxdusa neticede sadece hemin key uygun netice gelmeyecek




//      A D D    S T A T I C   I M A G E

function addStaticImage (req, res, next) {   
    const formData = {...req.body};
    const file = req.file;
    const filePath = file ? 
    `${req.protocol}://${req.get('host')}/${path.posix.join(...file.path.split(path.sep))}` 
    : null;
    const newStaticImage = {
        ...formData,
        image: filePath
    }    
    
    const {error} = staticImageInsertSchema.validate(newStaticImage, {abortEarly: false})    
    
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
        staticImageModel.getStaticImageByKey(newStaticImage.key)
            .then(data => {
                if (data) {
                    filePath && fileDelete(filePath);
                    next({
                        statusCode: 409,  // Conflict
                        message: `'${newStaticImage.key}' - staticImage already exist`,
                        data
                    })
                } else {
                    staticImageModel.addStaticImage(newStaticImage)
                        .then(addedStaticImage => {
                            res.status(201).json({
                                message: "StaticImage successfully inserted",
                                data: addedStaticImage
                            });
                        })
                        .catch(error => {
                            filePath && fileDelete(filePath);
                            next({
                                statusCode: 500,
                                message: "An error occurred while adding staticImage",
                                error
                            })
                        })
                }
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "Unexpected error occurred while adding staticImage",
                    error
                })
            })
    }
}




//      U P D A T E    S T A T I C   I M A G E       

function updateStaticImage (req, res, next) {
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
    
    const {error} = staticImageUpdateSchema.validate(editData, {abortEarly: false})   

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
        staticImageModel.getStaticImageByID(id)
            .then(data => {
                if (data) {
                    staticImageModel.updateStaticImage(id, editData)
                        .then(updatedData => {                            
                            Reflect.has(editData, "image") && data.image &&
                            fileDelete(data.image);

                            res.status(200).json({ message: "StaticImage updated successfully", data: updatedData });
                        })
                        .catch(error => {
                            filePath && fileDelete(filePath);
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating staticImage",
                                error
                            })
                        })
                } else {
                    filePath && fileDelete(filePath);
                    next({
                        statusCode: 404,
                        message: "The staticImage not found"
                    })
                }
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating staticImage",
                    error
                })
            })
    }
}




//      D E L E T E    S T A T I C   I M A G E

function deleteStaticImage (req, res, next) {
    const {id} = req.params;
    let imagePath;

    staticImageModel.getStaticImageByID(id)
        .then(data => {
            if (data) {                
                imagePath = data.image || null;

                staticImageModel.deleteStaticImage(id)
                    .then((deletedCount) => {                        
                        if (deletedCount) {
                            imagePath && fileDelete(imagePath);
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting staticImage"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            message: "Internal Server Error: Unexpected occurred while deleting staticImage",
                            error
                        })
                    })

            } else {
                next({
                    statusCode: 404,
                    message: "The staticImage not found"
                })
            }
        })
}
