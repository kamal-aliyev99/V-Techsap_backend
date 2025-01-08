const db = require("../../config/db-config");

module.exports = {
    getCustomers,
    getHomePageCustomers,
    getCustomerByID,
    addCustomer,
    updateCustomer,
    deleteCustomer
}

function getCustomers () {
    return db("customer");
}

function getHomePageCustomers (limit) {
    const data = db("customer")
        .where("showHomePage", true)
    
    if (limit) {
        return data.limit(limit)
    } else {
        return data
    }
}

function getCustomerByID (id) {
    return db("customer")
        .where({id})
        .first()
}

function addCustomer (newCustomer) { 
    return db("customer")
        .insert(newCustomer)
        .returning("*")
        .then(([data]) => data)
}

function updateCustomer (id, updateData) {
    return db("customer")
        .where({id})
        .update(updateData)
        .returning("*")
        .then(([data]) => data)
}

function deleteCustomer (id) {
    return db("customer")
        .where({id})
        .del()
}