/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('lang').del()
  await knex('lang').insert([
    {
      // id: 1,
      langCode: "en",
      name: "English"
    },
    {
      // id: 2,
      langCode: "az",
      name: "Azerbaijani"
    },
    {
      // id: 3,
      langCode: "ru",
      name: "Russian"
    },
  ]);
};
