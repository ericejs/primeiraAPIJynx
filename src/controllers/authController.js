import usersRepository from "../repositories/usersRepository.js";
import bcrypt from "bcrypt";

const authController = {

    async verifyUser(email) {
        let user = await usersRepository.getByEmail(email);

        if (!user.length > 0) {
            return user[0];
        }
        return null;
    },

    async verifyLogin(request) { 
        const { email, password } = request.body

        let existUser = await this.verifyUser(email)

        if (!existUser) {
            return "Usuário não encontrado"
    }

}

export default authController;