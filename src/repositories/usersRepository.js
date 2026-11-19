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
        SELECT * FROM users
        `    
    },
    async post(name, age, email, password) {
        await db`
            INSERT INTO users (name, age, email, password)
            VALUES (${name}, ${age}, ${email}, ${password})
            RETURNING *
        `
        return `Usuario ${name} cadastrado com sucesso!`
    },
    async put(id, name, age, email, password) {
        await db` 
        UPDATE users 
        SET
            name = ${name},
            age = ${age},
            email = ${email},
            password = ${password}
        WHERE id = ${id} 
        `
        return `Usuario ${name} atualizado com sucesso!`
    },
    async delete(id) {
        return await db`
        DELETE FROM users 
        WHERE id = ${id} 
        RETURNING *
        `
    },
    async getOne(email) {
        return await db` 
        SELECT * FROM users WHERE email = ${email}
        `    
    },
}

export default usersRepository