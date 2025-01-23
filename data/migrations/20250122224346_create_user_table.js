/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
      .createTable("user", table => {
          table.increments("id").primary();
          table.string("fullName").notNullable();
          table.string("username").unique().notNullable();
          table.string("email").unique().notNullable();
          table.string("password_hash").notNullable(); 
          table.integer("role").notNullable().defaultTo(1);   // 0 - Admin, 1 - user (default)
          table.timestamps(true, true);
      })
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists("user")
  };
  