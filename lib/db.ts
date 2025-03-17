import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/schema";

// Load Supabase credentials from environment variables
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Use the Supabase database connection
const connection = postgres(process.env.SUPABASE_DATABASE_URL!, { ssl: "require" });

// Initialize Drizzle with Supabase connection
export const db = drizzle(connection, { schema });
