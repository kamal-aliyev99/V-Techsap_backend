const db = require("../../config/db-config");

module.exports = {
    getLangs,
    getLangByID,
    getLangByLangCode,
    addLang,
    deleteLang,
    updateLang
}

function getLangs () {
    return db("lang");
}

function getLangByID (id) {
    return db("lang")
        .where({id})
        .first()
}

function getLangByLangCode (langCode) {    
    return db("lang")
        .where({langCode})
        .first()
}

function addLang (newLang) {
    return db("lang")
        .insert(newLang)
        .returning("*")
        .then(([data]) => data)
}

function deleteLang (id) {
    return db("lang")
        .where({id})
        .del()
}

function updateLang (id, updateData) {
    return db("lang")
        .where({id})
        .update(updateData)
        .returning("*")
        .then(([data]) => data)
}