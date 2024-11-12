import { neon } from "@neondatabase/serverless"

const sql = neon(import.meta.env.VITE_DATABASE_URL)

export const coloursRowCount = async () => {
    const result = await sql`SELECT count(*) FROM colours;`
    return result
}
