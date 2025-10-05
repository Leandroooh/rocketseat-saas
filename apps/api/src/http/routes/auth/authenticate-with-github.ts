import { prisma } from '@/lib/prisma';
import { FastifyInstance } from 'fastify';
import z from 'zod';
import { compare } from 'bcryptjs';
import { BadRequestError } from '../_erros/bad-request-erro';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { TokenType } from '@prisma/client';

export async function authenticateWithGitHub(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/session/github',
    {
      schema: {
        tags: ['auth'],
        summary: 'Authenticate with GitHub',
        body: z.object({
          code: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { code } = request.body;

      const githubOAuthUrl = new URL('https://github.com/login/oauth/access_token');

      githubOAuthUrl.searchParams.set('code', code);
      githubOAuthUrl.searchParams.set('client_id', 'Ov23liw0U0sbFhL0NX8o');
      githubOAuthUrl.searchParams.set('client_secret', 'e6ce65d53da718b2c991dbdd3298775b850f6e57');
      githubOAuthUrl.searchParams.set('redirect_uri', 'http://http://localhost:3000/api/auth/callback');

      const githubAccessTokenResponse = await fetch(githubOAuthUrl, {
        method: 'POST',
        headers: { accept: 'application/json' },
      });

      const githubAccessTokenData = await githubAccessTokenResponse.json();

      const { access_token: githubAccessToken } = z
        .object({
          access_token: z.string(),
          TokenType: z.literal('bearer'),
          scope: z.string(),
        })
        .parse(githubAccessTokenData);

      const githubUserResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `bearer ${githubAccessToken}`,
        },
      });

      const githubUserData = await githubUserResponse.json();

      const {
        githubId,
        avatar_url: avatarUrl,
        name,
        email,
      } = z
        .object({
          githubId: z.number().int().transform(String),
          avatar_url: z.string(),
          name: z.string().nullable(),
          email: z.string().email().nullable(),
        })
        .parse(githubUserData);

      if (email === null) {
        throw new BadRequestError('Your github account must have an email to authenticate');
      }

      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name,
            email,
            avatarUrl,
          },
        });
      }

      let account = await prisma.account.findUnique({
        where: {
          provider_userId: {
            provider: 'GITHUB',
            userId: user.id,
          },
        },
      });

      if (!account) {
        account = await prisma.account.create({
          data: {
            provider: 'GITHUB',
            providerAccountId: githubId,
            userId: user.id,
          },
        });
      }

      const token = await reply.jwtSign(
        {
          sub: user.id,
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
