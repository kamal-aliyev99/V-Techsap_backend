const staticTextModel = require("../../models/staticText/staticText_model");
const langModel = require("../../models/lang/lang_model");

const Joi = require("joi");

const staticTextInsertSchema = Joi.object({
    key: Joi.string().max(255).required(),
    translation: Joi.array()
        .items(
            Joi.object({
                langCode: Joi.string().max(10).required(),
                value: Joi.string().max(255).required() 
            })
        )
        .min(1) // arrayda min 1 obj olmalidi - for key
        .required()
});

const staticTextUpdateSchema = Joi.object({
    id: Joi.number().positive().required(),
    key: Joi.string().max(255).required(),
    value: Joi.string().max(255).required(),
    translationID: Joi.number().positive(),  
    langCode: Joi.string().max(10)
})

const defaultLang = "en";

module.exports = {
    getStaticTexts,
    getStaticTextByKeyOrID,
    addStaticText,
    updateStaticText,
    deleteStaticText
}


//      G E T    A L L    Static Text

function getStaticTexts (req, res, next) {
    const lang = req.query.lang || defaultLang;    

    staticTextModel.getStaticTextsWithLang(lang)  
        .then(staticTexts => {
            res.status(200).json(staticTexts);
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




//      G E T    Static Text   b y   I D  /  K E Y

function getStaticTextByKeyOrID (req, res, next) {
    const param = req.params.keyOrID;
    const lang = req.query.lang || defaultLang;
    const isParamNaN = isNaN(Number(param))

    const modelFunction = 
    isParamNaN ?
    "getStaticTextByKeyWithLang" :
    "getStaticTextByIDWithLang" 

    staticTextModel[modelFunction](param, lang)
        .then(staticText => {
            if (staticText) {
                res.status(200).json(staticText);
            } else {
                if (!isParamNaN) {
                    staticTextModel.getStaticTextByID(param)
                        .then(data => {
                            if (data) {
                                res.status(200).json(data);
                            } else {
                                next(
                                    {
                                        statusCode: 404,
                                        message: "The staticText Not Found",
                                    }
                                )
                            }
                        })
                } else {
                    next(
                        {
                            statusCode: 404,
                            message: "The staticText Not Found",
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




//      A D D    S t a t i c    T e x t

function addStaticText (req, res, next) {   
    const formData = {...req.body};
    formData.translation = JSON.parse(formData.translation)
    const {translation, ...staticTextData} = formData;
        
    const {error} = staticTextInsertSchema.validate(formData, {abortEarly: false})    
    
    if (error) {
        const errors = error?.details?.map(err => ({  // error sebebi
            field: err.context.key,
            message: err.message
        }));

        next({
            statusCode: 400,
            message: "Bad Request: The server could not understand the request because of invalid syntax.",
            errors
        })  
        
    } else {
        staticTextModel.getStaticTextByKey(formData.key)
            .then(data => {
                if (data) {
                    next({
                        statusCode: 409,  // Conflict
                        message: `'${formData.key}' this key already exist`,
                        data
                    })
                } else {
                    langModel.getLangs()
                        .then(langs => {
                            langs.forEach(lang => {
                                const exists = translation.some(tr => tr.langCode === lang.langCode);
                                
                                if (!exists) {
                                    translation.push({
                                        langCode: lang.langCode,
                                        value: staticTextData.key
                                    });
                                }
                            });
                            
                            staticTextModel.addStaticText(staticTextData, translation)
                                .then(id => {
                                    res.status(201).json({
                                        message: "StaticText successfully inserted",
                                        data: {id}
                                    })
                                })
                                .catch(error => {
                                    next({
                                        statusCode: 500,
                                        message: "An error occurred while adding StaticText",
                                        error
                                    })
                                })                            
                        })
                }
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Unexpected error occurred while adding StaticText",
                    error
                })
            })
    }
}

//  ~~EXAMPLE~~  Add StaticText - request body:

// const exampleAddData = {
//     key: "home-page",   // same as en.value

//     translation: [
//         {langCode: "en", value: "Home page"},  
//         {langCode: "az", value: "Ana sehife"}
//     ]
// }




//      U P D A T E    Static Text

function updateStaticText (req, res, next) {
    const {id} = req.params;
    const formData = {...req.body};

    const {id: staticTextID, key, value, translationID, langCode} = formData,
    staticTextData = { id: staticTextID, key },
    translationData = {id: translationID, staticText_id: id, value, langCode};

    
    const {error} = staticTextUpdateSchema.validate(formData, {abortEarly: false})   


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
        staticTextModel.getStaticTextByID(id)
            .then(data => {
                if (data) {
                    staticTextModel.updateStaticText(id, staticTextData, translationData)
                        .then(() => {
                            res.status(200).json({
                                message: "StaticText updated successfully"
                            })
                        })
                        .catch(error => {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating staticText",
                                error
                            })
                        })
                } else {
                    next({
                        statusCode: 404,
                        message: "The staticText not found"
                    })
                }
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating staticText",
                    error
                })
            })
    }
}

//  ~~EXAMPLE~~  Add StaticText - request body:

// const exampleUpdateData = {
//     id : 10,
//     key : "about-us",
//     value : "Haqqimizda",
//     translationID : 6,
//     langCode: "az"  // optional
// }




//      D E L E T E    Static Text

function deleteStaticText (req, res, next) {
    const {id} = req.params;

    staticTextModel.getStaticTextByID(id)
        .then(data => {
            if (data) {
                staticTextModel.deleteStaticText(id)
                    .then(deletedCount => {
                        if (deletedCount) {
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting staticText"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            message: "Internal Server Error: Unexpected occurred while deleting staticText",
                            error
                        })
                    })

            } else {
                next({
                    statusCode: 404,
                    message: "The staticText not found"
                })
            }
        })
        .catch(error => {
            next({
                statusCode: 500,
                message: "Internal Server Error: Unexpected occurred while deleting staticText",
                error
            })
        })
}







