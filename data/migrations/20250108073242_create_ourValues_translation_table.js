/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
      .createTable("ourValues_translate", table => {
          table.increments("id").primary();
          table.integer("ourValues_id").unsigned().notNullable();
          table.string("langCode", 10).notNullable();
          table.string("title").notNullable();
          table.text("desc");
  
          table
            .foreign("ourValues_id")
            .references("id")
            .inTable("ourValues")
            .onUpdate("CASCADE")
            .onDelete("CASCADE")
  
          table
            .foreign("langCode")
            .references("langCode")
            .inTable("lang")
            .onUpdate("CASCADE")
            .onDelete("CASCADE")
  
          table.unique(["ourValues_id", "langCode"], {indexName: "unique_ourValuesID_langCode"})
      })
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists("ourValues_translate")
  };
  