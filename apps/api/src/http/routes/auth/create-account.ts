import { prisma } from '@/lib/prisma';
import { FastifyInstance } from 'fastify';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { BadRequestError } from '../_erros/bad-request-erro';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        tags: ['auth'],
        summary: 'Create a new account',
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

      const [, domain] = email.split('');

      const autoJoinOrganization = await prisma.organization.findFirst({
        where: {
          domain,
          shouldAttachUsersByDomain: true,
        },
      });

      if (userWithSameEmail) {
        throw new BadRequestError('User with same email already exist');
      }

      const passwordHash = await hash(password, 6);
      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          // Entender essa parte depois
          member_on: autoJoinOrganization
            ? {
                create: {
                  organizationId: autoJoinOrganization.id,
                },
              }
            : undefined,
        },
      });

      return reply.status(201).send({ message: 'User created!' });
    }
  );
}
