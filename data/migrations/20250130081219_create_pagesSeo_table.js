/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .createTable("pagesSeo", table => {
            table.increments("id").primary();
            table.string("page").unique().notNullable(); 
            table.string("title").notNullable();
            table.text("description");
            table.text("keywords");
      })
  };
  
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists("pagesSeo")
};
