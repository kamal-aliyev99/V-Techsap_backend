const settingModel = require("../../models/setting/setting_model");

const Joi = require("joi");

const settingInsertSchema = Joi.object({
    key: Joi.string().max(255).required(),
    value: Joi.string().allow(null, '')
})

const settingUpdateSchema = settingInsertSchema.concat(
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
    getSettings,
    getSettingByKeyOrID,
    getSettingsByKeysArray,
    addSetting,
    updateSetting,
    deleteSetting
}


//      G E T    A L L    S E T T I N G

function getSettings (req, res, next) {
    settingModel.getSettings()  
        .then(settings => {
            res.status(200).json(settings);
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




//      G E T    S E T T I N G   b y   I D  /  K E Y

function getSettingByKeyOrID (req, res, next) {
    const param = req.params.keyOrID;

    const modelFunction = 
    isNaN(Number(param)) ?
    "getSettingByKey" :
    "getSettingByID" 

    settingModel[modelFunction](param)
        .then(setting => {
            if (setting) {
                res.status(200).json(setting);
            } else {
                next(
                    {
                        statusCode: 404,
                        message: "The setting Not Found",
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



//      G E T    S E T T I N G s   b y   Keys (array)

function getSettingsByKeysArray (req, res, next) {
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
        settingModel.getSettingsByKeysArray(keysArr)
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




//      A D D    S E T T I N G

function addSetting (req, res, next) {   
    const formData = {...req.body};

    const {error} = settingInsertSchema.validate(formData, {abortEarly: false})    
    
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
        settingModel.getSettingByKey(formData.key)
            .then(data => {
                if (data) {
                    next({
                        statusCode: 409,  // Conflict
                        message: `'${formData.key}' this key already exist`,
                        data
                    })
                } else {
                    settingModel.addSetting(formData)
                        .then(addedSetting => {
                            res.status(201).json({
                                message: "Setting successfully inserted",
                                data: addedSetting
                            });
                        })
                        .catch(error => {
                            next({
                                statusCode: 500,
                                message: "An error occurred while adding setting",
                                error
                            })
                        })
                }
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Unexpected error occurred while adding setting",
                    error
                })
            })
    }
}




//      U P D A T E    S E T T I N G

function updateSetting (req, res, next) {
    const {id} = req.params;
    const formData = {...req.body};
    
    const {error} = settingUpdateSchema.validate(formData, {abortEarly: false})   

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
        settingModel.getSettingByID(id)
            .then(data => {
                if (data) {
                    settingModel.updateSetting(id, formData)
                        .then(updatedData => {                            
                            res.status(200).json({ message: "Setting updated successfully", data: updatedData });
                        })
                        .catch(error => {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating setting",
                                error
                            })
                        })
                } else {
                    next({
                        statusCode: 404,
                        message: "The setting not found"
                    })
                }
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating setting",
                    error
                })
            })
    }
}




//      D E L E T E    S E T T I N G

function deleteSetting (req, res, next) {
    const {id} = req.params;

    settingModel.getSettingByID(id)
        .then(data => {
            if (data) {
                settingModel.deleteSetting(id)
                    .then(deletedCount => {
                        if (deletedCount) {
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting setting"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            message: "Internal Server Error: Unexpected occurred while deleting setting",
                            error
                        })
                    })

            } else {
                next({
                    statusCode: 404,
                    message: "The setting not found"
                })
            }
        })
        .catch(error => {
            next({
                statusCode: 500,
                message: "Internal Server Error: Unexpected occurred while deleting service",
                error
            })
        })
}



//      Note :

//  edit olunan datada yeni key ferqli data'da varsa 500 internal server error verecek

