const customTextModel = require("../../models/customText/customText_model");
const langModel = require("../../models/lang/lang_model");

const Joi = require("joi");

const customTextInsertSchema = Joi.object({
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

const customTextUpdateSchema = Joi.object({
    id: Joi.number().positive().required(),
    key: Joi.string().max(255).required(),
    value: Joi.string().max(255).required(),
    translationID: Joi.number().positive(),  
    langCode: Joi.string().max(10)
})

const getDatasByArraySchema = Joi.array()
  .items(
    Joi.string().max(255).required() 
  )
  .min(1)
  .required();

const defaultLang = "en";

module.exports = {
    getCustomTexts,
    getCustomTextByKeyOrID,
    getCustomTextsByKeysArray,
    addCustomText,
    updateCustomText,
    deleteCustomText
}


//      G E T    A L L    customTexts

function getCustomTexts (req, res, next) {
    const lang = req.query.lang ||defaultLang;    

    customTextModel.getCustomTextsWithLang(lang)  
        .then(customTexts => {
            res.status(200).json(customTexts);
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




//      G E T    customText   b y   I D  /  K E Y

function getCustomTextByKeyOrID (req, res, next) {
    const param = req.params.keyOrID;
    const lang = req.query.lang || defaultLang;
    const isParamNaN = isNaN(Number(param))

    const modelFunction = 
    isParamNaN ?
    "getCustomTextByKeyWithLang" :
    "getCustomTextByIDWithLang" 

    customTextModel[modelFunction](param, lang)
        .then(customText => {
            if (customText) {
                res.status(200).json(customText);
            } else {
                if (!isParamNaN) {
                    customTextModel.getCustomTextByID(param)
                        .then(data => {
                            if (data) {
                                res.status(200).json(data);
                            } else {
                                next(
                                    {
                                        statusCode: 404,
                                        message: "The customText Not Found",
                                    }
                                )
                            }
                        })
                } else {
                    next(
                        {
                            statusCode: 404,
                            message: "The customText Not Found",
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




//      G E T    CustomTexts   b y   Keys (array)

function getCustomTextsByKeysArray (req, res, next) {
    const keysArr = req.body;
    const lang = req.query.lang || defaultLang;
    
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
        customTextModel.getCustomTextsByKeysArrayWithLang(keysArr, lang)
        .then(datas => {
            if (datas.length) {
                const datasObject = datas.reduce((obj, item) => {
                    return {
                        ...obj,
                        [item.key]: item.value
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




//      A D D    customText

function addCustomText (req, res, next) {   
    const formData = {...req.body};
    formData.translation = JSON.parse(formData.translation)
    const {translation, ...customTextData} = formData;
    
    const {error} = customTextInsertSchema.validate(formData, {abortEarly: false})    
    
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
        customTextModel.getCustomTextByKey(formData.key)
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
                                        value: customTextData.key
                                    });
                                }
                            });
                            
                            customTextModel.addCustomText(customTextData, translation)
                                .then(id => {
                                    res.status(201).json({
                                        message: "CustomText successfully inserted",
                                        data: {id}
                                    })
                                })
                                .catch(error => {
                                    next({
                                        statusCode: 500,
                                        message: "An error occurred while adding customText",
                                        error
                                    })
                                })                            
                        })
                }
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Unexpected error occurred while adding customText",
                    error
                })
            })
    }
}

//  ~~EXAMPLE~~  Add customText - request body:

// const exampleAddData = {
//     key: "homeBanner-3",  

//     translation: [
//         {langCode: "en", value: "3. homeBanner descriptionn"},  
//         {langCode: "az", value: "3. homeBanner haqqindaaaa"}
//     ]
// }




//      U P D A T E    customText

function updateCustomText (req, res, next) {
    const {id} = req.params;
    const formData = {...req.body};

    const {id: customTextID, key, value, translationID, langCode} = formData,
    customTextData = { id: customTextID, key },
    translationData = {id: translationID, customText_id: id, value, langCode};

    
    const {error} = customTextUpdateSchema.validate(formData, {abortEarly: false})   


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
        customTextModel.getCustomTextByID(id)
            .then(data => {
                if (data) {
                    customTextModel.updateCustomText(id, customTextData, translationData)
                        .then(() => {
                            res.status(200).json({
                                message: "CustomText updated successfully"
                            })
                        })
                        .catch(error => {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating customText",
                                error
                            })
                        })
                } else {
                    next({
                        statusCode: 404,
                        message: "The customText not found"
                    })
                }
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating customText",
                    error
                })
            })
    }
}

//  ~~EXAMPLE~~  Update customText - request body:

// const exampleUpdateData = {
//     id: 2,
//     key: "homeBanner-2",
//     value: "2. homeBanner descriptionn",
//     translationID: 4,
//     langCode: "en"
// }



//      D E L E T E    customText

function deleteCustomText (req, res, next) {
    const {id} = req.params;

    customTextModel.getCustomTextByID(id)
        .then(data => {
            if (data) {
                customTextModel.deleteCustomText(id)
                    .then(deletedCount => {
                        if (deletedCount) {
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting customText"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            message: "Internal Server Error: Unexpected occurred while deleting customText",
                            error
                        })
                    })

            } else {
                next({
                    statusCode: 404,
                    message: "The customText not found"
                })
            }
        })
        .catch(error => {
            next({
                statusCode: 500,
                message: "Internal Server Error: Unexpected occurred while deleting customText",
                error
            })
        })
}







