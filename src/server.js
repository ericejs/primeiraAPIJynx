import Fastify from 'fastify'
import usersRoutes from "./routes/usersRoutes.js"
import authRoutes from "./routes/authRoutes.js"

const fastify = Fastify({
  logger: true
})

fastify.get('/', async () => {
  return "Servidor funcionando na porta 3000"
})

await fastify.register(usersRoutes, { prefix: '/users' })
await fastify.register(authRoutes)

const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()