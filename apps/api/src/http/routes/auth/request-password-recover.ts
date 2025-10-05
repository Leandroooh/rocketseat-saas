import { prisma } from '@/lib/prisma';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { BadRequestError } from '../_erros/bad-request-erro';
import { Auth } from '@/http/middlewares/Auth';

export async function requestPasswordRecover(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(Auth)
    .post(
      '/session/password/recover',
      {
        schema: {
          tags: ['auth'],
          summary: 'Change user password',
          body: z.object({
            email: z.string().email(),
          }),
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { email } = request.body;

        const userFromEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (!userFromEmail) {
          // We dont want people to know if user really exists
          return reply.status(201).send();
        }

        const { id: code } = await prisma.token.create({
          data: {
            type: 'PASSWORD_RECOVER',
            userId: userFromEmail.id,
          },
        });

        console.log('Recover password token', code);
        return reply.status(201).send();
      }
    );
}
