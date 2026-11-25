import Fastify from 'fastify'

import usersRoutes from "./routes/usersRoutes.js"
import authRoutes from './routes/authRoutes.js'

import cors from '@fastify/cors'

const fastify = Fastify({
  logger: true
})


// teste

await fastify.register( usersRoutes, { prefix: '/users' } )
await fastify.register( authRoutes )


await fastify.register( cors,  { 
  methods: '*',
  origin: '*'
 } )


fastify.get("/", async () => {
  return "Servidor funcionando (°ー°〃)"
})


const start = async () => {

  try {
    await fastify.listen({ port: 3001,  host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }

}

start()