/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
      .createTable("serviceBenefit_translation", table => {
          table.increments("id").primary();
          table.integer("serviceBenefit_id").unsigned().notNullable();
          table.string("langCode", 3).notNullable();
          table.string("title").notNullable();
          table.text("desc");

          table
            .foreign("serviceBenefit_id")
            .references("id")
            .inTable("serviceBenefit")
            .onUpdate("CASCADE")
            .onDelete("CASCADE")
  
          table
            .foreign("langCode")
            .references("langCode")
            .inTable("lang")
            .onUpdate("CASCADE")
            .onDelete("CASCADE")
  
          table.unique(["serviceBenefit_id", "langCode"], {indexName: "unique_serviceBenefitID_langCode"})
      })
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists("serviceBenefit_translation")
  };
  