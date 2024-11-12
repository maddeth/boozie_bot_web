import { neon } from "@neondatabase/serverless"

const sql = neon(import.meta.env.DATABASE_URL)

export const coloursRowCount = async (req, res) => {
    const result = await sql`SELECT version()`
    const { version } = result[0]
    res.writeHead(200, { "Content-Type": "text/plain" })
    res.end(version)
}
