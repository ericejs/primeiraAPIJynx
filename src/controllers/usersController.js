import usersRepository from "../repositories/usersRepository.js"
import bcrypt from "bcrypt"

const usersController = {

    async get() {
        return await usersRepository.get()
    },

    async post(request) {
        const { name, age, email, password } = request.body

        let saltRound = 10

        let passcrypt = await bcrypt.hash(password, saltRound)

        return await usersRepository.post(name, age, email, passcrypt)
    },

    async put(request) {
        const { id, name, age, email, password } = request.body

        let saltRound = 10

        let passcrypt = await bcrypt.hash(password, saltRound)

        return await usersRepository.put(id, name, age, email, passcrypt)
    },

    async delete(request) {
        const { id } = request.body
        return await usersRepository.delete(id)
    }
}

export default usersController