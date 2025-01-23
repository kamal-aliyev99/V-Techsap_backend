const db = require("../../config/db-config");

module.exports = {
    getContactBase,
    getContactBaseByID,
    addContactBase,
    updateIsReadContactBase,
    deleteContactBase
}

function getContactBase () {
    return db("contactBase");
}

function getContactBaseByID (id) {
    return db("contactBase")
        .where({id})
        .first()
}

function addContactBase (newContactBase) { 
    return db("contactBase")
        .insert(newContactBase)
        .returning("*")
        .then(([data]) => data)
}

function updateIsReadContactBase (id, isRead) {
    return db("contactBase")
        .where({id})
        .update({isRead})
}

function deleteContactBase (id) {
    return db("contactBase")
        .where({id})
        .del()
}
