import usersController from "../controllers/usersController.js";

export default async function usersRoutes(fastify) {
    fastify.get("/get", async () => {
        return await usersController.get()
    })

    fastify.post("/post", async (request) => {
        return await usersController.post(request)
    })

    fastify.put("/put", async (request) => {
        return await usersController.put(request)
    })

    fastify.delete("/delete", async (request) => {
        return await usersController.delete(request)
    })
}