import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema  from "./schema";

config({ path: ".env" });

// Use this for local PG database.
// export const db = drizzle(process.env.DATABASE_URL!, {schema}); 

// This is for the supabase
const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: {
        rejectUnauthorized: false,
    },
});

export const db = drizzle(pool, { schema })

console.log(process.env.DATABASE_URL)
