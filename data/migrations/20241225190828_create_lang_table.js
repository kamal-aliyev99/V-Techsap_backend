/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .createTable("lang", (table) => {
            table.increments("id").primary();
            table.string("langCode", 3).unique().notNullable();
            table.string("name", 50).notNullable();
            table.text("image");
        })
};
  
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists("lang")
};
  