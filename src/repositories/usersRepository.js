import "dotenv/config"

import { neon } from "@neondatabase/serverless"

const dataBase = process.env.DATABASE_URL

if (!dataBase) {
    throw new Error('DATABASE_URL não foi encontrado no arquivo .env')
}

const db = neon(dataBase)

const usersRepository = {

    async get() {
        return await db` 
        SELECT id, name, age, email FROM users
        `    
    },

    async getOne(email) {
        return await db` 
        SELECT * FROM users WHERE email = ${email}
        `    
    },

    async post(name, age, email, password) {
        await db`
        INSERT INTO users (name, age, email, password)
        VALUES (${name}, ${age}, ${email}, ${password})
        `
        return `Usuario: ${name}, cadastrado com sucesso!`
    },

    async put(id, name, age, email, password) {
        return await db` 
        UPDATE users 
        SET
            name = ${name},
            age = ${age},
            email = ${email},
            password = ${password}
        WHERE id = ${id} 
        RETURNING id, name, age, email
        `
    },

    async delete(id) {
        return await db`
        DELETE FROM users 
        WHERE id = ${id} 
        RETURNING id, name, age, email
        `
    }
    
}

export default usersRepository