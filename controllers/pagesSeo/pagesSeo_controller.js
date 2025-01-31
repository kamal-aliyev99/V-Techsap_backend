const pagesSeoModel = require("../../models/pagesSeo/pagesSeo_model");

const Joi = require("joi");

const pagesSeoInsertSchema = Joi.object({
    page: Joi.string().max(255).required(),
    title: Joi.string().allow(null, ''),
    description: Joi.string().optional().allow(null, ""),
    keywords: Joi.string().optional().allow(null, "")
})

const pagesSeoUpdateSchema = pagesSeoInsertSchema.concat(
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
    getPagesSeos,
    getPagesSeoByPageOrID,
    addPagesSeo,
    updatePagesSeo,
    deletePagesSeo
}


//      G E T    A L L    pagesSeo

function getPagesSeos (req, res, next) {
    pagesSeoModel.getPagesSeos()  
        .then(datas => {
            res.status(200).json(datas);
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




//      G E T    pagesSeo   b y   I D  /  K E Y

function getPagesSeoByPageOrID (req, res, next) {
    const param = req.params.pageOrID;

    const modelFunction = 
    isNaN(Number(param)) ?
    "getPagesSeoByPage" :
    "getPagesSeoByID" 

    pagesSeoModel[modelFunction](param)
        .then(data => {
            if (data) {
                res.status(200).json(data);
            } else {
                next(
                    {
                        statusCode: 404,
                        message: "The page Not Found",
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





//      A D D    pagesSeo

function addPagesSeo (req, res, next) {   
    const formData = {...req.body};

    const {error} = pagesSeoInsertSchema.validate(formData, {abortEarly: false})    
    
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
        pagesSeoModel.getPagesSeoByPage(formData.page)
            .then(data => {
                if (data) {
                    next({
                        statusCode: 409,  // Conflict
                        message: `'${formData.page}' this page already exist`,
                        data
                    })
                } else {
                    pagesSeoModel.addPagesSeo(formData)
                        .then(addedData => {
                            res.status(201).json({
                                message: "PagesSeo successfully inserted",
                                data: addedData
                            });
                        })
                        .catch(error => {
                            next({
                                statusCode: 500,
                                message: "An error occurred while adding pagesSeo",
                                error
                            })
                        })
                }
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Unexpected error occurred while adding pagesSeo",
                    error
                })
            })
    }
}




//      U P D A T E    pagesSeo

function updatePagesSeo (req, res, next) {
    const {id} = req.params;
    const formData = {...req.body};
    
    const {error} = pagesSeoUpdateSchema.validate(formData, {abortEarly: false})   

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
        pagesSeoModel.getPagesSeoByID(id)
            .then(data => {
                if (data) {
                    pagesSeoModel.updatePagesSeo(id, formData)
                        .then(updatedData => {                            
                            res.status(200).json({ message: "Page seos updated successfully", data: updatedData });
                        })
                        .catch(error => {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating page",
                                error
                            })
                        })
                } else {
                    next({
                        statusCode: 404,
                        message: "The page not found"
                    })
                }
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating page",
                    error
                })
            })
    }
}




//      D E L E T E    pagesSeo

function deletePagesSeo (req, res, next) {
    const {id} = req.params;

    pagesSeoModel.getPagesSeoByID(id)
        .then(data => {
            if (data) {
                pagesSeoModel.deletePagesSeo(id)
                    .then(deletedCount => {
                        if (deletedCount) {
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting page"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            message: "Internal Server Error: Unexpected occurred while deleting page",
                            error
                        })
                    })

            } else {
                next({
                    statusCode: 404,
                    message: "The page not found"
                })
            }
        })
        .catch(error => {
            next({
                statusCode: 500,
                message: "Internal Server Error: Unexpected occurred while deleting page",
                error
            })
        })
}



//      Note :

//  edit olunan datada yeni page ferqli data'da varsa 500 internal server error verecek

