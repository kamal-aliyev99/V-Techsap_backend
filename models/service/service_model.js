const db = require("../../config/db-config");

module.exports = {
    getServices,
    getServicesWithLang,
    getServiceByID,
    getServiceByIDWithLang,
    getServiceBySlug,
    getServiceBySlugWithLang,
    addService,
    updateService,
    deleteService
}


//      Get all services

function getServices () {
    return db("service");
}


//      Get all services with Lang

async function getServicesWithLang (lang, perPage = 6, page = 1) {        
    const data = await db("service_translation")
        .join("lang", "service_translation.langCode", "lang.langCode")
        .join("service", "service_translation.service_id", "service.id")
        .select(
            "service.id",
            "service.slug",
            "service.image",
            "service_translation.id as translationID",
            "service_translation.title",
            "service_translation.shortDesc",
        )
        .where("lang.langCode", lang)
        .limit(perPage)
        .offset(perPage * (page-1))

    const [{dataCount}] = await db("service").count("id as dataCount")

    const dataObj = {
        data,
        pageCount: Math.ceil(dataCount / perPage),
        currentPage: +page,
        done: Math.ceil(dataCount / perPage) == page
    }    

    return dataObj
}


//      Get service by  ID

function getServiceByID (id) {
    return db("service")
        .where({id})
        .first()
}


//      Get service by  ID  with Lang

async function getServiceByIDWithLang (id, lang) {
    const serviceData = await db("service_translation")
        .join("lang", "service_translation.langCode", "lang.langCode")
        .join("service", "service_translation.service_id", "service.id")
        .select(
            "service.*",
            "service_translation.id as translationID",
            "service_translation.title",
            "service_translation.shortDesc",
            "service_translation.subTitle",
            "service_translation.benefitsTitle",
            "service_translation.customersTitle",
            "service_translation.desc",
            "lang.langCode"
        )
        .where("service.id", id)
        .andWhere("lang.langCode", lang)  
        .first() 

    const serviceSpecs = await db("serviceSpecs_translation")  
        .join("lang", "serviceSpecs_translation.langCode", "lang.langCode")
        .join("serviceSpecs", "serviceSpecs_translation.serviceSpecs_id", "serviceSpecs.id")
        .select(
            "serviceSpecs.id",
            "serviceSpecs.service_id",
            // "serviceSpecs.id as serviceSpecs_id",
            "serviceSpecs_translation.id as translationID",
            "serviceSpecs_translation.title",
            "serviceSpecs_translation.desc",
            "lang.langCode"
        )
        .where("serviceSpecs.service_id", id)
        .andWhere("lang.langCode", lang)

    const serviceBenefits = await db("serviceBenefit_translation")
        .join("lang", "serviceBenefit_translation.langCode", "lang.langCode")
        .join("serviceBenefit", "serviceBenefit_translation.serviceBenefit_id", "serviceBenefit.id")
        .select(
            "serviceBenefit.id",
            "serviceBenefit.service_id",
            // "serviceBenefit.id as serviceBenefit_id",
            "serviceBenefit_translation.id as translationID",
            "serviceBenefit_translation.title",
            "serviceBenefit_translation.desc",
            "lang.langCode"
        )
        .where("serviceBenefit.service_id", id)
        .andWhere("lang.langCode", lang)

    const serviceCustomers = await db("service_customer")
        .join("service", "service_customer.service_id", "service.id")
        .join("customer", "service_customer.customer_id", "customer.id")
        .select(
            "service_customer.*",
            "customer.title",
            "customer.image"
        )
        .where("service.id", id)

    const data = {
        ...serviceData,
        specs: serviceSpecs,
        benefits: serviceBenefits,
        customers: serviceCustomers
    }

        
    return data
}


//      Get service by  slug

function getServiceBySlug (slug) {    
    return db("service")
        .where({slug})
        .first()
}


//      Get service by  slug  with Lang

async function getServiceBySlugWithLang(slug, lang) {
    const serviceData = await db("service_translation")
        .join("lang", "service_translation.langCode", "lang.langCode")
        .join("service", "service_translation.service_id", "service.id") 
        .select(
            "service.*",
            "service_translation.id as translationID",
            "service_translation.title",
            "service_translation.shortDesc",
            "service_translation.subTitle",
            "service_translation.benefitsTitle",
            "service_translation.customersTitle",
            "service_translation.desc",
            "lang.langCode"
        )
        .where("service.slug", slug)
        .andWhere("lang.langCode", lang)  
        .first() 

    const serviceSpecs = await db("serviceSpecs_translation")  
        .join("lang", "serviceSpecs_translation.langCode", "lang.langCode")
        .join("serviceSpecs", "serviceSpecs_translation.serviceSpecs_id", "serviceSpecs.id")
        .select(
            "serviceSpecs.id",
            "serviceSpecs.service_id",
            // "serviceSpecs.id as serviceSpecs_id",
            "serviceSpecs_translation.id as translationID",
            "serviceSpecs_translation.title",
            "serviceSpecs_translation.desc",
            "lang.langCode"
        )
        .where("serviceSpecs.service_id", serviceData.id)
        .andWhere("lang.langCode", lang)

    const serviceBenefits = await db("serviceBenefit_translation")
        .join("lang", "serviceBenefit_translation.langCode", "lang.langCode")
        .join("serviceBenefit", "serviceBenefit_translation.serviceBenefit_id", "serviceBenefit.id")
        .select(
            "serviceBenefit.id",
            "serviceBenefit.service_id",
            // "serviceBenefit.id as serviceBenefit_id",
            "serviceBenefit_translation.id as translationID",
            "serviceBenefit_translation.title",
            "serviceBenefit_translation.desc",
            "lang.langCode"
        )
        .where("serviceBenefit.service_id", serviceData.id)
        .andWhere("lang.langCode", lang)

    const serviceCustomers = await db("service_customer")
        .join("service", "service_customer.service_id", "service.id")
        .join("customer", "service_customer.customer_id", "customer.id")
        .select(
            "service_customer.*",
            "customer.title",
            "customer.image"
        )
        .where("service.id", serviceData.id)

    const data = {
        ...serviceData,
        specs: serviceSpecs,
        benefits: serviceBenefits,
        customers: serviceCustomers
    }

        
    return data
}


//      Add Service

function addService (serviceData, translation, specs, benefits, customersID) { 
    return db.transaction(async trx => {
        const [{id}] = await trx("service").insert(serviceData).returning("id");

        const translationData = translation.map(data => {
            return {
                ...data,
                service_id: id
            }
        })
        await trx("service_translation").insert(translationData);

        const customersData = customersID.map(customerID => { 
            return {
                service_id: id,
                customer_id: customerID
            }
        })
        customersData.length && await trx("service_customer").insert(customersData);

        for (const dataArray of specs) {
            const [{id: specID}] = await trx("serviceSpecs").insert({service_id:id}).returning("id")

            const specTranslation = dataArray.map(specTR => {
                return {
                    ...specTR,
                    serviceSpecs_id: specID
                }
            })
            await trx("serviceSpecs_translation").insert(specTranslation)
        }

        for (const dataArray of benefits) {
            const [{id: benefitID}] = await trx("serviceBenefit").insert({service_id:id}).returning("id")

            const benefitTranslation = dataArray.map(benefitTR => {
                return {
                    ...benefitTR,
                    serviceBenefit_id: benefitID
                }
            })
            await trx("serviceBenefit_translation").insert(benefitTranslation)
        }

        return id;
    })
}


//      Update Service

function updateService (
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
) {
    return db.transaction(async trx => {
        await trx("service")
            .where({id})
            .update(serviceData)

        await trx("service_translation")
            .insert(translationData)
            .onConflict(["service_id", "langCode"])
            .merge() 

        const customersData = addCustomers.map(customerID => { 
            return {
                service_id: id,
                customer_id: customerID
            }
        })
        customersData.length && await trx("service_customer").insert(customersData);

        deletedCustomers.length && await trx("service_customer")
            .whereIn("id", deletedCustomers)
            .del()

        for (const data of specs) {
            await trx("serviceSpecs_translation")
                .where("id", data.id)
                .update(data)
        }

        for (const dataArray of newSpecs) {
            const [{id: specID}] = await trx("serviceSpecs").insert({service_id:id}).returning("id")

            const specTranslation = dataArray.map(specTR => {
                return {
                    ...specTR,
                    serviceSpecs_id: specID
                }
            })
            await trx("serviceSpecs_translation").insert(specTranslation)
        }

        deletedSpecs.length && await trx("serviceSpecs")
            .whereIn("id", deletedSpecs)
            .del()

        for (const data of benefits) {
            await trx("serviceBenefit_translation")
                .where("id", data.id)
                .update(data)
        }

        for (const dataArray of newBenefits) {
            const [{id: benefitID}] = await trx("serviceBenefit").insert({service_id:id}).returning("id")

            const benefitTranslation = dataArray.map(benefitTR => {
                return {
                    ...benefitTR,
                    serviceBenefit_id: benefitID
                }
            })
            await trx("serviceBenefit_translation").insert(benefitTranslation)
        }

        deletedBenefits.length && await trx("serviceBenefit")
            .whereIn("id", deletedBenefits)
            .del()

        return id;
    })
}


//      Delete Service

function deleteService (id) {
    return db("service")
        .where({id})
        .del()
}