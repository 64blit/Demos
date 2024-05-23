import Fastify from 'fastify';
import FastifyVite from '@fastify/vite';
import { EyePop } from "@eyepop.ai/eyepop";
import process from 'process';

const POP_UUID = 'e4fd9369a9de42f6becfb90e11f4620c';
const POP_API_SECRET = 'AAEx0k5X9gzahbFdKDNq33wLZ0FBQUFBQmwtS2NTMmZiVEJISU9yelBXVnVPUnQ4cC1wOVBHSDBWa3lrZW5QSnRIdVcxQXFBMmJobEFCSUV6dnNheG01aWVJdHc1SEZKN2VkaGhTMXViS3ZtaTRESy1GeW1fVnYxZFl5LWVtTTZ2RzJBN01CWnM9';

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
await server.listen({ port: 8000 })

console.log('http://localhost:8000')
