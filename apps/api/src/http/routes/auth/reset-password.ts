import { prisma } from '@/lib/prisma';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { Auth } from '@/http/middlewares/Auth';
import { Unauthorized } from '../_erros/unauthorized-error';
import { hash } from 'bcryptjs';

export async function resetPassword(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(Auth)
    .post(
      '/session/password/reset',
      {
        schema: {
          tags: ['auth'],
          summary: 'Change user password',
          body: z.object({
            code: z.string(),
            password: z.string().min(6),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { code, password } = request.body;

        const tokenFromCode = await prisma.token.findUnique({
          where: { id: code },
        });

        if (!tokenFromCode) {
          throw new Unauthorized();
        }

        const passwordHash = await hash(password, 6);

        await prisma.user.update({
          where: {
            id: tokenFromCode.userId,
          },
          data: {
            passwordHash,
          },
        });

        return reply.status(204).send();
      }
    );
}
