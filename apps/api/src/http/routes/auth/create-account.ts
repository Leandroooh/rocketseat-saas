import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    'users',
    {
      schema: {
        body: z.object({
          name: z.string(),
          email: z.string(),
          password: z.string().min(6),
        }),
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body;

      const userWithSameEmail = await prisma.user.findFirst({
        where: { email },
      });

      if (userWithSameEmail) {
        return reply.status(400).send({ message: 'User with same email already exist' });
      }

      const passwordHash = await hash(password, 6);
      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });

      return reply.status(201).send({ message: 'User created!' });
    }
  );
}
