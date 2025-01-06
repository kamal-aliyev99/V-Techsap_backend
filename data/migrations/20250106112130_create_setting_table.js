/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .createTable("setting", table => {
            table.increments("id").primary();
            table.string("key").unique().notNullable(); // slug esasinda saxlayacaq, meselen (email, phone, logo)
            table.text("value");  // e.g. (0123456789, test@gmail.com, immageURL ...)
      })
  };
  
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists("setting")
};
