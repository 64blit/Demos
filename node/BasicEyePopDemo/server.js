import Fastify from 'fastify';
import FastifyVite from '@fastify/vite';
import { EyePop } from "@eyepop.ai/eyepop";
import process from 'process';

const POP_UUID = process.env.EYEPOP_POP_ID || '7798a7faaad645aeb7021b9c231c8dc2';
const POP_API_SECRET = process.env.EYEPOP_SECRET_KEY || 'AAGkggPIZ06_xgV2gF5YYCJHZ0FBQUFBQm1LLTBnU3RKXzZ1dktnSDRDRjFwNWlKb3U4M0dnM21NMHpmZnZHTTRDSWtpU1BQeDRMMTY0UEdJTFZuXzJJRE5xVWFvWmg4WHFDb2ZicjRKd0dQaWd1Yjk5dWMwemg1OUpzMGN4UkFxbTJkNUxESWc9';

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
