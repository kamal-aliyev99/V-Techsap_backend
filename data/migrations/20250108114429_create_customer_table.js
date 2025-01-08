/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
      .createTable("customer", table => {
          table.increments("id").primary();
          table.string("title").notNullable();
          table.text("image");   // image path
          table.boolean("showHomePage").defaultTo(false);
      })
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists("customer")
  };
  