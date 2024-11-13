import { neon } from "@neondatabase/serverless"

const sql = neon(import.meta.env.VITE_DATABASE_URL)

export const coloursRowCount = async () => {
  const result = await sql`SELECT count(*) FROM colours;`
  return result
}

export const getSpecificColourById = async (req) => {
  const result = await sql`SELECT colourname FROM colours where id=${req};`
  return result
}

export const getLastColour = async () => {
  const result = await sql`select * from colours order by id desc limit 1;`
  return result
}