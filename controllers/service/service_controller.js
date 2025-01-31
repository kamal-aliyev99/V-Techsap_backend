const serviceModel = require("../../models/service/service_model");
const langModel = require("../../models/lang/lang_model");
const fileDelete = require("../../middlewares/fileDelete");

const Joi = require("joi");
const path = require("path");

const serviceInsertSchema = Joi.object({
    slug: Joi.string().max(255).required(),
    image: Joi.string().allow(null),
    benefitImage: Joi.string().allow(null),
    seoTitle: Joi.string().max(255).allow(null, ""),
    seoDesc: Joi.string().allow(null, ""),
    seoKeywords: Joi.string().allow(null, ""),
    translation: Joi.array()
        .items(
            Joi.object({
                langCode: Joi.string().max(3).required(),
                title: Joi.string().max(255).required(),
                shortDesc: Joi.string().max(255).allow(""),
                subTitle: Joi.string().max(255).allow(""),
                desc: Joi.string().allow(""),
                benefitsTitle: Joi.string().max(255).allow(""),
                customersTitle: Joi.string().max(255).allow("")
            })
        )
        .min(1) // arrayda min 1 obj olmalidi - for key
        .required(),

    specs: Joi.array()
        .items(
            Joi.array()
                .items(
                    Joi.object({
                        langCode: Joi.string().max(3).required(),
                        title: Joi.string().max(255).required(),
                        desc: Joi.string().max(255).allow(""),
                    })
                )
        )
        .required(),
    
    benefits: Joi.array()
        .items(
            Joi.array()
                .items(
                    Joi.object({
                        langCode: Joi.string().max(3).required(),
                        title: Joi.string().max(255).required(),
                        desc: Joi.string().max(255).allow(""),
                    })
                )
        )
        .required(), 

    customersID: Joi.array().items(Joi.number()).required()
})

const serviceUpdateSchema = Joi.object({
    id: Joi.number().positive().required(),
    slug: Joi.string().max(255),
    image: Joi.string().allow(null),
    benefitImage: Joi.string().allow(null),
    seoTitle: Joi.string().max(255).allow(null, ""),
    seoDesc: Joi.string().allow(null, ""),
    seoKeywords: Joi.string().allow(null, ""),
    translationID: Joi.number().positive(),
    langCode: Joi.string().max(10),
    title: Joi.string().max(255).required(),
    subTitle: Joi.string().max(255).allow(''),
    shortDesc: Joi.string().max(255).allow(''),
    benefitsTitle: Joi.string().max(255).allow(''),
    customersTitle: Joi.string().max(255).allow(''),
    desc: Joi.string().allow(''),
    specs: Joi.array(),
    newSpecs: Joi.array(),
    deletedSpecs: Joi.array(),
    benefits: Joi.array(),
    newBenefits: Joi.array(),
    deletedBenefits: Joi.array(),
    addCustomers: Joi.array(),
    deletedCustomers: Joi.array(),
})


const defaultLang = "en";

module.exports = {
    getServices,
    getServiceBySlugOrID,
    addService,
    updateService,
    deleteService
}


//      Get all services 

function getServices (req, res, next) {
    const {lang: langParam, perPage: perPageParam, page: pageParam} = req.query;
    const lang = langParam || defaultLang;
    const perPage = (!isNaN(Number(perPageParam)) && perPageParam > 0) ? perPageParam : undefined;
    const page = (!isNaN(Number(pageParam)) && pageParam > 0) ? pageParam : undefined; 
    
    serviceModel.getServicesWithLang(lang, perPage, page)  
        .then(services => {
            res.status(200).json(services);
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



//      Get service by ID / slug

function getServiceBySlugOrID (req, res, next) {
    const param = req.params.slugOrID;
    const lang = req.query.lang || defaultLang;
    const isParamNaN = isNaN(Number(param))

    const modelFunction = 
    isParamNaN ?
    "getServiceBySlugWithLang" :
    "getServiceByIDWithLang" 

    serviceModel[modelFunction](param, lang) 
        .then(service => {
            if (service) {
                res.status(200).json(service);
            } else {
                if (!isParamNaN) {
                    serviceModel.getServiceByID(param)
                        .then(data => {
                            if (data) {
                                res.status(200).json(data);
                            } else {
                                next(
                                    {
                                        statusCode: 404,
                                        message: "The service Not Found",
                                    }
                                )
                            }
                        })
                } else {
                    next(
                        {
                            statusCode: 404,
                            message: "The service Not Found",
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


//      Add service

function addService (req, res, next) {
    const formData = {...req.body};
    formData.translation = JSON.parse(formData.translation);
    formData.specs = JSON.parse(formData.specs);
    formData.benefits = JSON.parse(formData.benefits);
    formData.customersID = JSON.parse(formData.customersID);
    const image = req.files?.image && req.files?.image[0];
    const benefitImage = req.files?.benefitImage && req.files?.benefitImage[0];
    const imagePath = image ? 
    `${req.protocol}://${req.get('host')}/${path.posix.join(...image.path.split(path.sep))}` 
    : null;        

    const benefitImagePath = benefitImage ? 
    `${req.protocol}://${req.get('host')}/${path.posix.join(...benefitImage.path.split(path.sep))}` 
    : null;

    const newService = {
        ...formData,    
        image: imagePath,
        benefitImage: benefitImagePath
    }
    const {translation, customersID, specs, benefits, ...serviceData} = newService;  
    
    const {error} = serviceInsertSchema.validate(newService, {abortEarly: false})  
    
    if (error) {
        imagePath && fileDelete(imagePath);  
        benefitImagePath && fileDelete(benefitImagePath);  
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
        serviceModel.getServiceBySlug(serviceData.slug)
            .then(data => {
                if (data) {
                    imagePath && fileDelete(imagePath);  
                    benefitImagePath && fileDelete(benefitImagePath); 
                    next({
                        statusCode: 409,  // Conflict
                        message: `'${serviceData.slug}' this slug already exist`,
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
                                        title: serviceData.slug,
                                        shortDesc: "",
                                        subTitle: "",
                                        desc: "",
                                        benefitsTitle: "",
                                        customersTitle: ""
                                    })
                                }

                                specs.forEach(dataArray => {
                                    const specsExistLang = dataArray.some(tr => tr.langCode === lang.langCode)
                                    if (!specsExistLang) {
                                        dataArray.push({
                                            langCode: lang.langCode,
                                            title: "",
                                            desc: ""
                                        })
                                    }
                                })

                                benefits.forEach(dataArray => {
                                    const benefitsExistLang = dataArray.some(tr => tr.langCode === lang.langCode)
                                    if (!benefitsExistLang) {
                                        dataArray.push({
                                            langCode: lang.langCode,
                                            title: "",
                                            desc: ""
                                        })
                                    }
                                })
                            });
    
                            serviceModel.addService(serviceData, translation, specs, benefits, customersID)
                                .then(id => {
                                    res.status(201).json({
                                        message: "Service successfully inserted",
                                        data: {id}
                                    })
                                })
                                .catch(error => {
                                    imagePath && fileDelete(imagePath);  
                                    benefitImagePath && fileDelete(benefitImagePath); 
                                    next({
                                        statusCode: 500,
                                        message: "An error occurred while adding Service",
                                        error
                                    })
                                })
                            
                        })
                }
            })
            .catch(error => {
                imagePath && fileDelete(imagePath);  
                benefitImagePath && fileDelete(benefitImagePath); 
                next({
                    statusCode: 500,
                    message: "Unexpected error occurred while adding Service",
                    error
                })
            })
    }
}

// const exampleNewService = {
//     slug: "it-service-1",
//     image: null,
//     benefitImage: null,
//     translation: [
//         {
//             langCode: "en",
//             title: "IT service 1",
//             shortDesc: "test",
//             subTitle: "dsadas",
//             desc: "IT service 1",
//             benefitsTitle: "fsd",
//             customersTitle: "fsdfsa"
//         },
//         {
//             langCode: "az",
//             title: "IT xidmeti 1",
//             shortDesc: "khjkhj",
//             subTitle: "oipioup",
//             desc: "IT Xidmeti 1",
//             benefitsTitle: "",
//             customersTitle: "987oijk"
//         }
//     ],
//     customersID: [1, 2, 4],
//     specs: [
//         [
//             {
//                 langCode: "en",
//                 title: "IT service specs 1",
//                 desc: "IT service specs 1"
//             },
//             {
//                 langCode: "az",
//                 title: "IT xidmeti ozellik 1",
//                 desc: "IT Xidmeti ozellik 1"
//             }
//         ],
//         [
//             {
//                 langCode: "en",
//                 title: "IT service specs 2",
//                 desc: "IT service specs 2"
//             },
//             {
//                 langCode: "az",
//                 title: "IT xidmeti ozellik 2",
//                 desc: "IT Xidmeti ozellik 2"
//             }
//         ]
//     ],
//     benefits: [
//         [
//             {
//                 langCode: "en",
//                 title: "IT service benefit 1",
//                 desc: "IT service benefit 1"
//             },
//             {
//                 langCode: "az",
//                 title: "IT xidmeti fayda 1",
//                 desc: "IT Xidmeti fayda 1"
//             }
//         ],
//         [
//             {
//                 langCode: "en",
//                 title: "IT service benefit 2",
//                 desc: "IT service benefit 2"
//             },
//             {
//                 langCode: "az",
//                 title: "IT xidmeti fayda 2",
//                 desc: "IT Xidmeti fayda 2"
//             }
//         ]
//     ]
// }



//      Update service

function updateService(req, res, next) {    
    const {id} = req.params;
    const formData = {...req.body};

    if (formData.image === "null") {
        formData.image = null;
    }
    if (formData.benefitImage === "null") {
        formData.benefitImage = null;
    }
    formData.specs = JSON.parse(formData.specs);
    formData.newSpecs = JSON.parse(formData.newSpecs);
    formData.deletedSpecs = JSON.parse(formData.deletedSpecs);
    formData.benefits = JSON.parse(formData.benefits);
    formData.newBenefits = JSON.parse(formData.newBenefits);
    formData.deletedBenefits = JSON.parse(formData.deletedBenefits);
    formData.addCustomers = JSON.parse(formData.addCustomers);
    formData.deletedCustomers = JSON.parse(formData.deletedCustomers);

    const file = req.files?.image && req.files?.image[0];
    const benefitFile = req.files?.benefitImage && req.files?.benefitImage[0];

    const filePath = file ? 
    `${req.protocol}://${req.get('host')}/${path.posix.join(...file.path.split(path.sep))}` 
    : null;

    const benefitImagePath = benefitFile ? 
    `${req.protocol}://${req.get('host')}/${path.posix.join(...benefitFile.path.split(path.sep))}` 
    : null;

    const serviceData ={
        id,
        slug: formData.slug,
        image: formData.image, 
        benefitImage: formData.benefitImage,
        seoTitle: formData.seoTitle,
        seoDesc: formData.seoDesc,
        seoKeywords: formData.seoKeywords,
    }

    const translationData = {
        id: formData.translationID,
        service_id: id,
        langCode: formData.langCode,
        title: formData.title,
        desc: formData.desc,
        subTitle: formData.subTitle,
        shortDesc: formData.shortDesc,
        benefitsTitle: formData.benefitsTitle,
        customersTitle: formData.customersTitle,
    }

    if (filePath) {
        serviceData.image = filePath
    } else {
        if (serviceData.image !== null) {
            Reflect.deleteProperty(serviceData, "image");
        }
    }

    if (benefitImagePath) {
        serviceData.benefitImage = benefitImagePath
    } else {
        if (serviceData.benefitImage !== null) {
            Reflect.deleteProperty(serviceData, "benefitImage");
        }
    }   

    const { 
        newSpecs, 
        deletedSpecs,
        newBenefits,
        deletedBenefits,
        addCustomers,
        deletedCustomers
    } = formData;

    const specs = formData.specs
        .filter(data => !deletedSpecs.includes(data.id))
        .map(data => ({
            id: data.translationID,
            title: data.title,
            desc: data.desc,
            langCode: data.langCode
    }))

    const benefits = formData.benefits
        .filter(data => !deletedBenefits.includes(data.id))
        .map(data => ({
            id: data.translationID,
            title: data.title,
            desc: data.desc,
            langCode: data.langCode
    }))




    // console.log(formData);
    


    const {error} = serviceUpdateSchema.validate(formData, {abortEarly: false})   

    if (error) {
        filePath && fileDelete(filePath);
        benefitImagePath && fileDelete(benefitImagePath);
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
        serviceModel.getServiceByID(id)
            .then(data => {
                if (data) {
                    serviceModel.updateService(
                        id, 
                        serviceData, 
                        translationData,
                        specs,
                        benefits,
                        newSpecs, 
                        deletedSpecs,
                        newBenefits,
                        deletedBenefits,
                        addCustomers,
                        deletedCustomers
                    )
                        .then(() =>{
                            Reflect.has(serviceData, "image") && data.image &&
                            fileDelete(data.image);
                            Reflect.has(serviceData, "benefitImage") && data.benefitImage &&
                            fileDelete(data.benefitImage);

                            res.status(200).json({
                                message: "Service updated successfully"
                            })
                        })
                        .catch(error => {
                            filePath && fileDelete(filePath);
                            benefitImagePath && fileDelete(benefitImagePath);
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating service",
                                error
                            })
                        })
                } else {
                    filePath && fileDelete(filePath);
                    benefitImagePath && fileDelete(benefitImagePath);
                    next({
                        statusCode: 404,
                        message: "The service not found"
                    })
                }
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                benefitImagePath && fileDelete(benefitImagePath);
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating service",
                    error
                })
            })
    }
}

// const exampleEditService = {

// }



//      delete Service

function deleteService(req, res, next) {
    const {id} = req.params;
    let imagePath;
    let benefitImagePath;

    serviceModel.getServiceByID(id)
        .then(data => {
            if (data) {
                imagePath = data.image || null;
                benefitImagePath = data.benefitImage || null;

                serviceModel.deleteService(id)
                    .then((deletedCount) => {                        
                        if (deletedCount) {
                            imagePath && fileDelete(imagePath);
                            benefitImagePath && fileDelete(benefitImagePath);

                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting service"
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
            } else {
                next({
                    statusCode: 404,
                    message: "The service not found"
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




