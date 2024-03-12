import Fastify from 'fastify';
import FastifyVite from '@fastify/vite';
import { EyePop } from "@eyepop.ai/eyepop";
import process from 'process';

const POP_UUID = process.env.EYEPOP_POP_ID || 'e4fd9369a9de42f6becfb90e11f4620c';
const POP_API_SECRET = process.env.EYEPOP_SECRET_KEY || 'AAF8CqARHHgQBcLhHqLPUjJxZ0FBQUFBQmw0QXNqX2pqMzlaZ292b05LdHhrRmowUGlrNUREUDVYQTE2TW1zQWYyU2U0eVRmQS0xSVdnWkZvRldQOGd2Y2hKWG9kYnI0MzJnRGwyWGJoTExYNkVwQzVLdHZvRzBIMTlLdTFaZ2JEWFJPTERzbTQ9';

const server = Fastify()

await server.register(FastifyVite, {
    root: import.meta.url,
    dev: process.argv.includes('--dev'),
    spa: true
})

server.get('/', (req, reply) =>
{
    return reply.html()
})

server.get('/eyepop/session', async (req, reply) =>
{
    console.log('Authenticating EyePop Session');
    // check if the request is from an authenticated user
    const isAuthenticated = req.headers.authorization;
    if (!isAuthenticated)
    {
        // console.log('Handle unauthorized request here');
    }

    try
    {

        const endpoint = await EyePop.endpoint(
            {
                popId: POP_UUID,
                auth: { secretKey: POP_API_SECRET }
            }).connect();

        let session = await endpoint.session();

        session = JSON.stringify(session);

        console.log('New EyePop Session:', session)

        reply.send(session);

    } catch (error)
    {
        console.error('Error:', error);
        reply.send({ error });
    }
});

server.setNotFoundHandler((req, reply) =>
{
    reply.code(404).send('Not Found')
})



await server.vite.ready()
await server.listen({ port: 3000 })
