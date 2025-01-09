/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
      .createTable("team_translation", table => {
          table.increments("id").primary();
          table.integer("team_id").unsigned().notNullable();
          table.string("langCode", 10).notNullable();
          table.string("name").notNullable();
          table.string("position");
  
          table
            .foreign("team_id")
            .references("id")
            .inTable("team")
            .onUpdate("CASCADE")
            .onDelete("CASCADE")
  
          table
            .foreign("langCode")
            .references("langCode")
            .inTable("lang")
            .onUpdate("CASCADE")
            .onDelete("CASCADE")
  
          table.unique(["team_id", "langCode"], {indexName: "unique_teamID_langCode"})
      })
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists("team_translation")
  };
  