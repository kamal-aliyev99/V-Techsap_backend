/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
      .createTable("contactBase", table => {
          table.increments("id").primary();
          table.string("name").notNullable();
          table.string("surname").notNullable();
          table.string("phone").notNullable();
          table.string("email").notNullable();
          table.text("message");
          table.timestamp("created_at").defaultTo(knex.fn.now());  
          table.boolean("isRead").defaultTo(false);
      })
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists("contactBase")
  };
  