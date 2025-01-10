/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
      .createTable("serviceSpecs_translation", table => {
          table.increments("id").primary();
          table.integer("serviceSpecs_id").unsigned().notNullable();
          table.string("langCode", 3).notNullable();
          table.string("title").notNullable();
          table.text("desc");

          table
            .foreign("serviceSpecs_id")
            .references("id")
            .inTable("serviceSpecs")
            .onUpdate("CASCADE")
            .onDelete("CASCADE")
  
          table
            .foreign("langCode")
            .references("langCode")
            .inTable("lang")
            .onUpdate("CASCADE")
            .onDelete("CASCADE")
  
          table.unique(["serviceSpecs_id", "langCode"], {indexName: "unique_serviceSpecsID_langCode"})
      })
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists("serviceSpecs_translation")
  };
  