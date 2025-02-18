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
        client: "pg",
        connection: process.env.DATABASE_URL,
        migrations: {
            directory: "../data/migrations"
        },
        seeds: {
            directory: "../data/seeds" 
        },
        pool: {
            min: 5, // Min bağlantı sayı
            max: 25, // Max bağlantı sayı
            idleTimeoutMillis: 30000,  // 1 dəqiqə sonra istifadə olunmayan bağlantını bağlayır
            reapIntervalMillis: 10000, // Hər 10 saniyədən bir hovuzu təmizləyir
            createRetryIntervalMillis: 200, // Uğursuz bağlantı üçün hər 200 ms gözləyir
        }
    }
}

