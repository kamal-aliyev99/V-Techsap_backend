const db = require("../../config/db-config");

module.exports = {
    getSettings,
    getSettingByID,
    getSettingByKey,
    getSettingsByKeysArray,
    addSetting,
    updateSetting,
    deleteSetting
}

function getSettings () {
    return db("setting");
}

function getSettingByID (id) {
    return db("setting")
        .where({id})
        .first()
}

function getSettingByKey (key) {    
    return db("setting")
        .where({key})
        .first()
}

function getSettingsByKeysArray (keysArr) {      
    return db("setting")
        .select("*")
        .whereIn('key', keysArr)
}

function addSetting (newSetting) { 
    return db("setting")
        .insert(newSetting)
        .returning("*")
        .then(([data]) => data)
}

function updateSetting (id, updateData) {
    return db("setting")
        .where({id})
        .update(updateData)
        .returning("*")
        .then(([data]) => data)
}

function deleteSetting (id) {
    return db("setting")
        .where({id})
        .del()
}