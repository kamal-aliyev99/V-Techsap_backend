/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
      .createTable("staticText_translation", table => {
          table.increments("id").primary();
          table.integer("staticText_id").unsigned().notNullable();
          table.string("langCode", 3).notNullable();
          table.string("value").notNullable();  // translated text
  
          table
            .foreign("staticText_id")
            .references("id")
            .inTable("staticText")
            .onUpdate("CASCADE")
            .onDelete("CASCADE")
  
          table
            .foreign("langCode")
            .references("langCode")
            .inTable("lang")
            .onUpdate("CASCADE")
            .onDelete("CASCADE")
  
          table.unique(["staticText_id", "langCode"], {indexName: "unique_staticTextID_langCode"})
      })
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists("staticText_translation")
  };
  