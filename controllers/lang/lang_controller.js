const langModel = require("../../models/lang/lang_model");
const fileDelete = require("../../middlewares/fileDelete");

const Joi = require("joi");
const path = require("path");

const langInsertSchema = Joi.object({
    langCode: Joi.string().max(10).required(),
    name: Joi.string().max(50).required(),
    image: Joi.string().allow(null)
})

const langUpdateSchema = langInsertSchema.concat(
    Joi.object({
        id: Joi.number().positive().required()
    })
);

module.exports = {
    getLangs,
    getLangByID,
    addLang,
    updateLang,
    deleteLang
}



//      G E T    A L L    L A N G U A G E S

function getLangs (req, res, next) {
    langModel.getLangs()
        .then(langs => { 
            res.status(200).json(langs);
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




//      G E T    L A N G   b y   I D

function getLangByID (req, res, next) {
    const {id} = req.params;

    langModel.getLangByID(id)
        .then(lang => {
            if (lang) {
                res.status(200).json(lang);
            } else {
                next(
                    {
                        statusCode: 404,
                        message: "Language Not Found",
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




//      A D D    L A N G

function addLang (req, res, next) {   
    const formData = req.body;
    const file = req.file;
    const filePath = file ? 
    `${req.protocol}://${req.get('host')}/${path.posix.join(...file.path.split(path.sep))}` 
    : null;
    const newLang = {
        ...formData,
        image: filePath
    }    
    
    const {error} = langInsertSchema.validate(newLang, {abortEarly: false})    
    
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
        langModel.getLangByLangCode(newLang.langCode)
            .then(data => {
                if (data) {
                    filePath && fileDelete(filePath);
                    next({
                        statusCode: 409,  // Conflict
                        message: `'${newLang.langCode}' langCode already exist`,
                        data
                    })
                } else {
                    langModel.addLang(newLang)
                        .then(addedLang => {
                            res.status(201).json({
                                message: "Language successfully inserted",
                                data: addedLang
                            });
                        })
                        .catch(error => {
                            filePath && fileDelete(filePath);
                            next({
                                statusCode: 500,
                                message: "An error occurred while adding language",
                                error
                            })
                        })
                }
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "Unexpected error occurred while adding language",
                    error
                })
            })
    }
}




//      U P D A T E    L A N G

function updateLang (req, res, next) {
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
        editData = {...formData}
        if (formData.image !== null) {
            Reflect.deleteProperty(editData, "image");
        }
    }    

    
    const {error} = langUpdateSchema.validate(editData, {abortEarly: false}) 

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
        langModel.getLangByID(id)
            .then(data => {
                if (data) {
                    langModel.updateLang(id, editData)
                        .then(updatedData => {                            
                            Reflect.has(editData, "image") && data.image &&
                            fileDelete(data.image);

                            res.status(200).json({ message: "Lang updated successfully", data: updatedData });
                        })
                        .catch(error => {
                            filePath && fileDelete(filePath);
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating language",
                                error
                            })
                        })
                } else {
                    filePath && fileDelete(filePath);
                    next({
                        statusCode: 404,
                        message: "The language not found"
                    })
                }
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating language",
                    error
                })
            })
    }
}




//      D E L E T E    L A N G

function deleteLang (req, res, next) {
    const {id} = req.params;
    let imagePath;

    langModel.getLangByID(id)
        .then(data => {
            if (data) {
                imagePath = data.image || null;

                langModel.deleteLang(id)
                    .then(deletedCount => {
                        if (deletedCount) {
                            imagePath && fileDelete(imagePath);
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting language"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            message: "Internal Server Error: Unexpected occurred while deleting language",
                            error
                        })
                    })

            } else {
                next({
                    statusCode: 404,
                    message: "The language not found"
                })
            }
        })
}