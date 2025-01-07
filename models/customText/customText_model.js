const db = require("../../config/db-config");

module.exports = {
    getCustomTexts,
    getCustomTextsWithLang,
    getCustomTextByID,
    getCustomTextByIDWithLang,
    getCustomTextByKey,
    getCustomTextByKeyWithLang,
    getCustomTextsByKeysArrayWithLang,
    addCustomText,
    updateCustomText,
    deleteCustomText
}


//      Get CustomText

function getCustomTexts() {   // not used
    return db("customText")
}


//      Get Datas - with Lang

function getCustomTextsWithLang(lang) {
    return db("customText_translate")
        .join("lang", "customText_translate.langCode", "lang.langCode")
        .join("customText", "customText_translate.customText_id", "customText.id")
        .select(
            "customText.*", 
            "customText_translate.value", 
            "customText_translate.id as translationID", 
            "lang.langCode"
        )
        .where("lang.langCode", lang);
}


//      Get Data by ID

function getCustomTextByID (id) {
    return db("customText")
        .where({id})
        .first()
}


//      Get Data by ID - with Lang (1 lang)

function getCustomTextByIDWithLang (id, lang) {
    return db("customText_translate")
        .join("lang", "customText_translate.langCode", "lang.langCode")
        .join("customText", "customText_translate.customText_id", "customText.id")
        .select(
            "customText.*", 
            "customText_translate.value", 
            "customText_translate.id as translationID", 
            "lang.langCode"
        )
        .where("lang.langCode", lang)
        .andWhere("customText.id", id)
        .first()
}


//      Get Data by Key

function getCustomTextByKey (key) {
    return db("customText")
        .where({key})
        .first()
}


//      Get Data by Key - with Lang

function getCustomTextByKeyWithLang (key, lang) {
    return db("customText_translate")
        .join("lang", "customText_translate.langCode", "lang.langCode")
        .join("customText", "customText_translate.customText_id", "customText.id")
        .select(
            "customText.*", 
            "customText_translate.value", 
            "customText_translate.id as translationID", 
            "lang.langCode"
        )
        .where("lang.langCode", lang)
        .andWhere("customText.key", key)
        .first()
}


//      Get Datas by Keys array - with Lang

function getCustomTextsByKeysArrayWithLang (keysArr, lang) {
    return db("customText_translate")
        .join("lang", "customText_translate.langCode", "lang.langCode")
        .join("customText", "customText_translate.customText_id", "customText.id")
        .select(
            "customText.*", 
            "customText_translate.value", 
            "customText_translate.id as translationID", 
            "lang.langCode"
        )
        .where("lang.langCode", lang)
        .whereIn("customText.key", keysArr)
}


//      Add Data
 
function addCustomText (customTextData, translation) {
    return db.transaction(async trx => {
            const [{id}] = await trx("customText").insert(customTextData).returning("id");

            const translationData = translation.map(data => { 
                return {
                    ...data,
                    customText_id: id,
                }
            })

            await trx("customText_translate").insert(translationData); 

            return id;
    })
}


//      Update Data

function updateCustomText (id, customTextData, translationData) {
    return db.transaction(async trx => {
        await trx("customText")
            .where({id})
            .update(customTextData)      

        await trx("customText_translate")
            .insert(translationData)
            .onConflict(["customText_id", "langCode"])
            .merge() 
    })
}


//      Delete Data

function deleteCustomText (id) {
    return db("customText")
        .where({id})
        .del()
}

