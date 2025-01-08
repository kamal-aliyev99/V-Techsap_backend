const ourValuesModel = require("../../models/ourValues/ourValues_model");
const langModel = require("../../models/lang/lang_model");
const fileDelete = require("../../middlewares/fileDelete");

const Joi = require("joi");
const path = require("path");

const ourValuesInsertSchema = Joi.object({
    slug: Joi.string().max(255).required(),
    image: Joi.string().allow(null),
    translation: Joi.array()
        .items(
            Joi.object({
                langCode: Joi.string().max(10).required(),
                title: Joi.string().max(255).required(),
                desc: Joi.string().allow('')
            })
        )
        .min(1) 
        .required()
})

const ourValuesUpdateSchema = Joi.object({
    id: Joi.number().positive().required(),
    slug: Joi.string().max(255),
    image: Joi.string().allow(null),
    translationID: Joi.number().positive(),
    langCode: Joi.string().max(10).required(),
    title: Joi.string().max(255).required(),
    desc: Joi.string().allow('')
})


const defaultLang = "en";

module.exports = {
    getOurValues,
    getOurValuesBySlugOrID,
    addOurValues,
    updateOurValues,
    deleteOurValues
}


//      Get all OurValues

function getOurValues (req, res, next) {
    const lang = req.query.lang || defaultLang;       

    ourValuesModel.getOurValuesWithLang(lang)  
        .then(ourValues => {
            res.status(200).json(ourValues);
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



//      Get OurValues by ID / slug

function getOurValuesBySlugOrID (req, res, next) {
    const param = req.params.slugOrID;
    const lang = req.query.lang || defaultLang;
    const isParamNaN = isNaN(Number(param))

    const modelFunction = 
    isParamNaN ?
    "getOurValuesBySlugWithLang" :
    "getOurValuesByIDWithLang" 

    ourValuesModel[modelFunction](param, lang) 
        .then(ourValues => {
            if (ourValues) {
                res.status(200).json(ourValues);
            } else {
                if (!isParamNaN) {
                    ourValuesModel.getOurValuesByID(param)
                        .then(data => {
                            if (data) {
                                res.status(200).json(data);
                            } else {
                                next(
                                    {
                                        statusCode: 404,
                                        message: "The ourValue Not Found",
                                    }
                                )
                            }
                        })
                } else {
                    next(
                        {
                            statusCode: 404,
                            message: "The ourValue Not Found",
                        }
                    )
                }
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


//      Add OurValues

function addOurValues (req, res, next) {
    const formData = {...req.body};
    formData.translation = JSON.parse(formData.translation);
    const file = req.file;
    const filePath = file ? 
    `${req.protocol}://${req.get('host')}/${path.posix.join(...file.path.split(path.sep))}` 
    : null;
    const newOurValues = {
        ...formData,    
        image: filePath
    }
    const {translation, ...ourValuesData} = newOurValues;

    const {error} = ourValuesInsertSchema.validate(newOurValues, {abortEarly: false})  
    
    if (error) {
        filePath && fileDelete(filePath);  
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

        ourValuesModel.getOurValuesBySlug(ourValuesData.slug)
            .then(data => {
                if (data) {
                    filePath && fileDelete(filePath);
                    next({
                        statusCode: 409,  // Conflict
                        message: `'${ourValuesData.slug}' this slug already exist`,
                        data
                    })
                } else {
                    langModel.getLangs()
                        .then(langs => {    
                            langs.forEach(lang => {
                                const existLang = translation.some(tr => tr.langCode === lang.langCode)
    
                                if (!existLang) {
                                    translation.push({
                                        langCode: lang.langCode,
                                        title: ourValuesData.slug,
                                    })
                                }
                            });
    
                            ourValuesModel.addOurValues(ourValuesData, translation)
                                .then(id => {
                                    res.status(201).json({
                                        message: "ourValues successfully inserted",
                                        data: {id}
                                    })
                                })
                                .catch(error => {
                                    filePath && fileDelete(filePath);
                                    next({
                                        statusCode: 500,
                                        message: "An error occurred while adding ourValues",
                                        error
                                    })
                                })  
                            
                        })
                }
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "Unexpected error occurred while adding ourValues",
                    error
                })
            })
    }
}

// const exampleNewOurValue = {
//     slug: "value-1",
//     image: null,
//     translation: [
//         {
//             langCode: "en",
//             title: "value 1",
//             desc: ""
//         },
//         {
//             langCode: "az",
//             title: "Deyer 1",
//             desc: ""
//         }
//     ]
// }



//      Update ourValues

function updateOurValues(req, res, next) {
    const {id} = req.params;
    const formData = {...req.body};
    if (formData.image === "null") {
        formData.image = null;
    }
    const file = req.file;
    const filePath = file ? 
    `${req.protocol}://${req.get('host')}/${path.posix.join(...file.path.split(path.sep))}` 
    : null;
    
    const {id: ourValuesID, slug, image, translationID, langCode, title, desc} = formData,
    ourValuesData = {id: ourValuesID, slug, image},
    translationData = {id: translationID, ourValues_id: id, langCode, title, desc}; 

    console.log(req.body.id);
    
    
    

    if (filePath) {
        ourValuesData.image = filePath
    } else {
        if (ourValuesData.image !== null) {
            Reflect.deleteProperty(ourValuesData, "image");
        }
    }   

    const {error} = ourValuesUpdateSchema.validate(formData, {abortEarly: false})   

    if (error) {
        filePath && fileDelete(filePath);
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
        ourValuesModel.getOurValuesByID(id)
            .then(data => {
                if (data) {
                    ourValuesModel.updateOurValues(id, ourValuesData, translationData)
                        .then(() =>{
                            Reflect.has(ourValuesData, "image") && data.image &&
                            fileDelete(data.image);

                            res.status(200).json({
                                message: "ourValues updated successfully"
                            })
                        })
                        .catch(error => {
                            filePath && fileDelete(filePath);
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating ourValues",
                                error
                            })
                        })
                } else {
                    filePath && fileDelete(filePath);
                    next({
                        statusCode: 404,
                        message: "The ourValues not found"
                    })
                }
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating ourValues",
                    error
                })
            })
    }
}

// const exampleEditOurValue = {
//     id: 4,
//     slug: "value-4",
//     image: null,
//     translationID: 10,   
//     langCode: "en",
//     title: "value 4",
//     desc: ""
// }



//      delete ourValues

function deleteOurValues(req, res, next) {
    const {id} = req.params;
    let imagePath;

    ourValuesModel.getOurValuesByID(id)
        .then(data => {
            if (data) {
                imagePath = data.image || null;

                ourValuesModel.deleteOurValues(id)
                    .then((deletedCount) => {                        
                        if (deletedCount) {
                            imagePath && fileDelete(imagePath);
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting ourValues"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            message: "Internal Server Error: Unexpected occurred while deleting ourValues",
                            error
                        })
                    })
            } else {
                next({
                    statusCode: 404,
                    message: "The ourValues not found"
                })
            }
        })
        .catch(error => {
            next({
                statusCode: 500,
                message: "Internal Server Error: Unexpected occurred while deleting ourValues",
                error
            })
        })
}




