import usersRepository from "../repositories/usersRepository.js";
import bcrypt from "bcrypt"

const authController = {

    async verificaUsuario(email) {

        let usuario = await usersRepository.getOne(email)

        if (usuario.length > 0) {
            return usuario[0]
        } else {
            return null
        }

    },

    async validaLogin(req) {
        const { email, password } = req.body

        let existeUsuario = await this.verificaUsuario(email)

        if (!existeUsuario) {
            return "Usuario ou senha incorreta!"
        }

        let valida = await bcrypt.compare(password, existeUsuario.password)


        if (!valida) {
            return "Usuario ou senha incorreta!"
        }


        return "Autorizado"


    }

}

export default authController