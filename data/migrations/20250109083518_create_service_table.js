/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
      .createTable("service", table => {
          table.increments("id").primary();
          table.string("slug").unique().notNullable();
          table.text("image");
          table.text("benefitImage");
      })
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists("service")
  };
  