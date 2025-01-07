/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
      .createTable("customText_translate", table => {
          table.increments("id").primary();
          table.integer("customText_id").unsigned().notNullable();
          table.string("langCode", 10).notNullable();
          table.text("value");
  
          table
            .foreign("customText_id")
            .references("id")
            .inTable("customText")
            .onUpdate("CASCADE")
            .onDelete("CASCADE")
  
          table
            .foreign("langCode")
            .references("langCode")
            .inTable("lang")
            .onUpdate("CASCADE")
            .onDelete("CASCADE")
  
          table.unique(["customText_id", "langCode"], {indexName: "unique_customTextID_langCode"})
      })
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists("customText_translate")
  };
  