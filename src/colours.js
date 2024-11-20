import { neon, Pool } from "@neondatabase/serverless"

const sql = neon(import.meta.env.VITE_DATABASE_URL)

export const coloursRowCount = async () => {
  try {
    const response = await sql('SELECT count(*) FROM colours')
    return "There are " + response[0].count + "rows in the colours DB"
  } catch (error) {
    return "Could not connect to the database"
  }
}

export const getSpecificColourById = async (req) => {
  const result = await sql('SELECT colourname FROM colours where id=$1', [ref])
  return result
}

export const getLastColour = async () => {
  const result = await sql('select * from colours order by id desc limit 1')
  return result
}

export const addColour = async (colour, hex, user) => {
  try {
    await sql('INSERT INTO colours (colourname, hex_value, username) VALUES ($1, $2, $3)', [colour, hex, user])
    const result = user + " added " + colour + " with hex of " + hex
    return result
  } catch (error) {
    if (error.toString().includes("duplicate key value violates unique constraint")) {
      return "Colour already exists"
    } else {
      return "Error adding colour"
    }
  }
}
