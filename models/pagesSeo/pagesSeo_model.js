const db = require("../../config/db-config");

module.exports = {
    getPagesSeos,
    getPagesSeoByID,
    getPagesSeoByPage,
    addPagesSeo,
    updatePagesSeo,
    deletePagesSeo
}

function getPagesSeos () {
    return db("pagesSeo");
}

function getPagesSeoByID (id) {
    return db("pagesSeo")
        .where({id})
        .first()
}

function getPagesSeoByPage (page) {    
    return db("pagesSeo")
        .where({page})
        .first()
}



function addPagesSeo (newPagesSeo) { 
    return db("pagesSeo")
        .insert(newPagesSeo)
        .returning("*")
        .then(([data]) => data)
}

function updatePagesSeo (id, updateData) {
    return db("pagesSeo")
        .where({id})
        .update(updateData)
        .returning("*")
        .then(([data]) => data)
}

function deletePagesSeo (id) {
    return db("pagesSeo")
        .where({id})
        .del()
}