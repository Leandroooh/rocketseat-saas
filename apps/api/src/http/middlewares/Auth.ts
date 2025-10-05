import fastifyPlugin from 'fastify-plugin';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { Unauthorized } from '../routes/_erros/unauthorized-error';

export const Auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request: FastifyRequest) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>();
        return sub;
      } catch {
        throw new Unauthorized('Invalid auth token');
      }
    };
  });
});
