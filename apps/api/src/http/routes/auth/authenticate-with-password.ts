import { prisma } from '@/lib/prisma';
import { FastifyInstance } from 'fastify';
import z from 'zod';
import { compare } from 'bcryptjs';
import { BadRequestError } from '../_erros/bad-request-erro';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/session/profile',
    {
      schema: {
        tags: ['auth'],
        summary: 'Authenticate with e-mail & password',
        body: z.object({
          email: z.string(),
          password: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const userFromEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (!userFromEmail) {
        throw new BadRequestError('invalid credentials');
      }

      if (userFromEmail.passwordHash === null) {
        throw new BadRequestError('User does not have a password, use social login');
      }

      const isPasswordValid = await compare(password, userFromEmail.passwordHash);

      if (!isPasswordValid) {
        throw new Error('Ivalid Credentials');
      }

      const token = await reply.jwtSign(
        {
          sub: userFromEmail.id,
        },
        {
          sign: {
            expiresIn: '7d',
          },
        }
      );

      return reply.status(201).send({ token });
    }
  );
}
