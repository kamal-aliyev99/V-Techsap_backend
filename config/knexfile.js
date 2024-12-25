module.exports = {
    development: {
        client: "pg",
        connection: {
            database: "v_techsap",
            user: "admin",
            password: "admin"
        },
        migrations: {
            directory: "../data/migrations"
        },
        seeds: {
            directory: "../data/seeds"
        }
    },
    production: {

    }
}

