/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
      .createTable("service_customer", table => {
          table.increments("id").primary();
          table.integer("service_id").unsigned().notNullable();
          table.integer("customer_id").unsigned().notNullable();
  
          table
            .foreign("service_id")
            .references("id")
            .inTable("service")
            .onUpdate("CASCADE")
            .onDelete("CASCADE")
  
          table
            .foreign("customer_id")
            .references("id")
            .inTable("customer")
            .onUpdate("CASCADE")
            .onDelete("CASCADE")
  
          table.unique(["service_id", "customer_id"], {indexName: "unique_service_customer"})
      })
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists("service_customer")
  };
  