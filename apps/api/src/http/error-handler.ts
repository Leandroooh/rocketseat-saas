import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { BadRequestError } from './routes/_erros/bad-request-erro';
import { Unauthorized } from './routes/_erros/unauthorized-error';

type FastifyErrorHandle = FastifyInstance['errorHandler'];

export const errorHandler: FastifyErrorHandle = (error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ message: 'Validation error', erros: error.flatten().fieldErrors });
  }

  if (error instanceof BadRequestError) {
    return reply.status(400).send({ message: error.message });
  }

  if (error instanceof Unauthorized) {
    return reply.status(401).send({ message: error.message });
  }

  console.log(error);
  // Error send to observability module

  return reply.status(500).send({ message: 'Internal server error' });
};
