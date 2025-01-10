/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
      .createTable("serviceBenefit", table => {
          table.increments("id").primary();
          table.integer("service_id").unsigned().notNullable();
  
          table
            .foreign("service_id")
            .references("id")
            .inTable("service")
            .onUpdate("CASCADE")
            .onDelete("CASCADE")
      })
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists("serviceBenefit")
  };
  