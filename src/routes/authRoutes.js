import authController from "../controllers/authController.js"


export default function authRoutes(fastify) {

    fastify.post("/login", async (req) =>{
        return await authController.validaLogin(req)
    })

}