/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable("service", table => {
        table.string("seoTitle"); 
        table.text("seoDesc"); 
        table.text("seoKeywords"); 
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable("service", table => {
        table.dropColumn("seoTitle"); 
        table.dropColumn("seoDesc"); 
        table.dropColumn("seoKeywords"); 
    });
};
