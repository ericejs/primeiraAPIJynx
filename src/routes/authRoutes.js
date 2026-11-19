import authController from "../controllers/authController.js"


export default function authRoutes(fastify) {
    fastify.post("/login", async (request) => {
        return await authController.verifyLogin(request);
    });
}