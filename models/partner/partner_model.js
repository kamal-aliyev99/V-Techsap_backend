const db = require("../../config/db-config");

module.exports = {
    getPartners,
    getPartnerByID,
    addPartner,
    updatePartner,
    deletePartner
}

function getPartners () {
    return db("partner");
}

function getPartnerByID (id) {
    return db("partner")
        .where({id})
        .first()
}

function addPartner (newPartner) { 
    return db("partner")
        .insert(newPartner)
        .returning("*")
        .then(([data]) => data)
}

function updatePartner (id, updateData) {
    return db("partner")
        .where({id})
        .update(updateData)
        .returning("*")
        .then(([data]) => data)
}

function deletePartner (id) {
    return db("partner")
        .where({id})
        .del()
}