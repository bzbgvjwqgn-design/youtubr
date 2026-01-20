{
  "driver": "pg",
  "dbCredentials": {
    "connectionString": "$DATABASE_URL"
  },
  "schema": "./src/db/schema.ts",
  "out": "./src/db/migrations"
}
