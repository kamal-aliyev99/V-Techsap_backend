const db = require("../../config/db-config");

module.exports = {
    getOurValues,
    getOurValuesWithLang,
    getOurValuesByID,
    getOurValuesByIDWithLang,
    getOurValuesBySlug,
    getOurValuesBySlugWithLang,
    addOurValues,
    updateOurValues,
    deleteOurValues
}


//      Get all ourValues

function getOurValues () {
    return db("ourValue");
}


//      Get all ourValues with Lang

function getOurValuesWithLang (lang) {
    const getData = db("ourValues_translate")
        .join("lang", "ourValues_translate.langCode", "lang.langCode")
        .join("ourValues", "ourValues_translate.ourValues_id", "ourValues.id")
        .select(
            "ourValues.*",
            "ourValues_translate.id as translationID",
            "ourValues_translate.title",
            "ourValues_translate.desc",
            "lang.langCode"
        )
        .where("lang.langCode", lang);

    return getData
}


//      Get ourValues by  ID

function getOurValuesByID (id) {
    return db("ourValues")
        .where({id})
        .first()
}


//      Get ourValues by  ID  with Lang

function getOurValuesByIDWithLang (id, lang) {
    return db("ourValues_translate")
        .join("lang", "ourValues_translate.langCode", "lang.langCode")
        .join("ourValues", "ourValues_translate.ourValues_id", "ourValues.id")
        .select(
            "ourValues.*",
            "ourValues_translate.id as translationID",
            "ourValues_translate.title",
            "ourValues_translate.desc",
            "lang.langCode"
        )
        .where("ourValues.id", id)
        .andWhere("lang.langCode", lang)  
        .first()  
}


//      Get ourValues by  slug

function getOurValuesBySlug (slug) {    
    return db("ourValues")
        .where({slug})
        .first()
}


//      Get ourValues by  slug  with Lang

function getOurValuesBySlugWithLang(slug, lang) {
    return db("ourValues_translate")
        .join("lang", "ourValues_translate.langCode", "lang.langCode")
        .join("ourValues", "ourValues_translate.ourValues_id", "ourValues.id")
        .select(
            "ourValues.*",
            "ourValues_translate.id as translationID",
            "ourValues_translate.title",
            "ourValues_translate.desc",
            "lang.langCode"
        )
        .where("ourValues.slug", slug)
        .andWhere("lang.langCode", lang) 
        .first()
}


//      Add ourValues

function addOurValues (newOurValues, translation) { 
    return db.transaction(async trx => {
        const [{id}] = await trx("ourValues").insert(newOurValues).returning("id");

        const translationData = translation.map(data => {
            return {
                ...data,
                ourValues_id: id
            }
        })

        await trx("ourValues_translate").insert(translationData);

        return id;
    })
}


//      Update ourValues

function updateOurValues (id, ourValuesData, translationData) {
    return db.transaction(async trx => {
        await trx("ourValues")
            .where({id})
            .update(ourValuesData)

        await trx("ourValues_translate")
            .insert(translationData)
            .onConflict(["ourValues_id", "langCode"])
            .merge() 
    })
}


//      Delete ourValues

function deleteOurValues (id) {
    return db("ourValues")
        .where({id})
        .del()
}