import { neon, Pool } from "@neondatabase/serverless"

const sql = neon(import.meta.env.VITE_DATABASE_URL)

export const coloursRowCount = async () => {
  try {
    const response = await sql('SELECT count(*) FROM colours')
    return response[0].count
  } catch (error) {
    console.log(error)
    return null
  }
}

export const getById = async (req) => {
  const response = sql('select * from colours where id = $1', [req])
  return response
}

export const getByColourName = async (req) => {
  const search = "'%" + req + "%'"
  const response = sql`select * from colours where colourname like ${search}`
  console.log(response)
  return response
}

export const getByHex = async (req) => {
  const response = sql('select * from colours where hex = $1', [req])
  return response
}

export const getByUserName = async (req) => {
  const response = sql('select * from colours where username = $1', [req])
  return response
}

export const getSpecificColourById = async (req) => {
  try {
    const response = await sql('SELECT colourname FROM colours where id=$1', [req])
    return response[0].colourname
  } catch (error) {
    return null
  }
}

export const getLastColour = async () => {
  try {
    const response = sql('select * from colours order by id desc limit 1')
    return response
  } catch (error) {
    return null
  }
}

export const addColour = async (colour, hex, user) => {
  try {
    await sql('INSERT INTO colours (colourname, hex_value, username) VALUES ($1, $2, $3)', [colour, hex, user])
    return user + " added " + colour + " with hex of " + hex
  } catch (error) {
    if (error.toString().includes("duplicate key value violates unique constraint")) {
      return "Colour already exists"
    } else {
      return "Error adding colour"
    }
  }
}
