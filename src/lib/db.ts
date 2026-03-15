import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/src/db/schema"; // Import the schema you just made

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

// This 'schema' key is vital for fixing "db.query" errors
export const db = drizzle(client, { schema });