const teamModel = require("../../models/team/team_model");
const langModel = require("../../models/lang/lang_model");
const fileDelete = require("../../middlewares/fileDelete");

const Joi = require("joi");
const path = require("path");

const teamInsertSchema = Joi.object({
    linkedin: Joi.string().max(255),
    image: Joi.string().allow(null),
    translation: Joi.array()
        .items(
            Joi.object({
                langCode: Joi.string().max(3).required(),
                name: Joi.string().max(255).required(),
                position: Joi.string().max(255).allow('')
            })
        )
        .min(1) 
        .required()
})

const teamUpdateSchema = Joi.object({
    id: Joi.number().positive().required(),
    linkedin: Joi.string().max(255),
    image: Joi.string().allow(null),
    translationID: Joi.number().positive(),
    langCode: Joi.string().max(3).required(),
    name: Joi.string().max(255).required(),
    position: Joi.string().max(255).allow('')
})


const defaultLang = "en";

module.exports = {
    getTeam,
    getTeamByID,
    addTeam,
    updateTeam,
    deleteTeam
}


//      Get all Team

function getTeam (req, res, next) {
    const {langCode, limit: limitParam, start: startParam} = req.query;
    const limit = !isNaN(+limitParam) && limitParam > 0 ? +limitParam : null;
    const start = !isNaN(+startParam) && startParam > 0 ? +startParam : null;
    const lang = langCode || defaultLang;    

    teamModel.getTeamWithLang(lang, limit, start)  
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



//      Get team by ID 

function getTeamByID (req, res, next) {
    const id = req.params.id;
    const lang = req.query.lang || defaultLang;

    teamModel.getTeamByIDWithLang(id, lang) 
        .then(data => {
            if (data) {
                res.status(200).json(data);
            } else {
                teamModel.getTeamByID(id)
                    .then(data => {
                        if (data) {
                            res.status(200).json(data);
                        } else {
                            next(
                                {
                                    statusCode: 404,
                                    message: "The team Not Found",
                                }
                            )
                        }
                    })
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


//      Add Team                                   

function addTeam (req, res, next) {
    const formData = {...req.body};
    formData.translation = JSON.parse(formData.translation);
    const file = req.file;
    const filePath = file ? 
    `${req.protocol}://${req.get('host')}/${path.posix.join(...file.path.split(path.sep))}` 
    : null;
    const newTeam = {
        ...formData,    
        image: filePath
    }
    const {translation, ...teamData} = newTeam;

    const {error} = teamInsertSchema.validate(newTeam, {abortEarly: false})  
    
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
        langModel.getLangs()
            .then(langs => {    
                langs.forEach(lang => {
                    const existLang = translation.some(tr => tr.langCode === lang.langCode)

                    if (!existLang) {
                        translation.push({
                            langCode: lang.langCode,
                            name: translation[0].name, 
                            position: translation[0].position
                        })
                    }
                });

                teamModel.addTeam(teamData, translation)
                    .then(id => {
                        res.status(201).json({
                            message: "team successfully inserted",
                            data: {id}
                        })
                    })
                    .catch(error => {
                        filePath && fileDelete(filePath);
                        next({
                            statusCode: 500,
                            message: "An error occurred while adding team",
                            error
                        })
                    })  
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "Unexpected error occurred while adding team",
                    error
                })
            })  
    }
}

// const exampleNewTeam = {
//     linkedin: "https://linkedin.com/...",
//     image: null,
//     translation: [
//         {
//             langCode: "en",
//             name: "value 1",
//             position: ""
//         },
//         {
//             langCode: "az",
//             name: "Deyer 1",
//             position: ""
//         }
//     ]
// }



//      Update team

function updateTeam(req, res, next) {
    const {id} = req.params;
    const formData = {...req.body};
    if (formData.image === "null") {
        formData.image = null;
    }
    const file = req.file;
    const filePath = file ? 
    `${req.protocol}://${req.get('host')}/${path.posix.join(...file.path.split(path.sep))}` 
    : null;
    
    const {id: teamID, linkedin, image, translationID, langCode, name, position} = formData,
    teamData = {id: teamID, linkedin, image},
    translationData = {id: translationID, team_id: id, langCode, name, position};     

    if (filePath) {
        teamData.image = filePath
    } else {
        if (teamData.image !== null) {
            Reflect.deleteProperty(teamData, "image");
        }
    }   

    const {error} = teamUpdateSchema.validate(formData, {abortEarly: false})   

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
        teamModel.getTeamByID(id)
            .then(data => {
                if (data) {
                    teamModel.updateTeam(id, teamData, translationData)
                        .then(() =>{
                            Reflect.has(teamData, "image") && data.image &&
                            fileDelete(data.image);

                            res.status(200).json({
                                message: "team updated successfully"
                            })
                        })
                        .catch(error => {
                            filePath && fileDelete(filePath);
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating team",
                                error
                            })
                        })
                } else {
                    filePath && fileDelete(filePath);
                    next({
                        statusCode: 404,
                        message: "The team not found"
                    })
                }
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating team",
                    error
                })
            })
    }
}

// const exampleEditTeam = {
//     id: 4,
//     linkedin: "https://...",
//     image: null,
//     translationID: 10,   
//     langCode: "en",
//     name: "value 4",
//     position: ""
// }



//      delete team

function deleteTeam(req, res, next) {
    const {id} = req.params;
    let imagePath;

    teamModel.getTeamByID(id)
        .then(data => {
            if (data) {
                imagePath = data.image || null;

                teamModel.deleteTeam(id)
                    .then((deletedCount) => {                        
                        if (deletedCount) {
                            imagePath && fileDelete(imagePath);
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting team"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            message: "Internal Server Error: Unexpected occurred while deleting team",
                            error
                        })
                    })
            } else {
                next({
                    statusCode: 404,
                    message: "The team not found"
                })
            }
        })
        .catch(error => {
            next({
                statusCode: 500,
                message: "Internal Server Error: Unexpected occurred while deleting team",
                error
            })
        })
}




