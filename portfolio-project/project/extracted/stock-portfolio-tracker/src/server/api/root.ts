import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 */
export const appRouter = createTRPCRouter({});

// export type definition of API
export type AppRouter = typeof appRouter;
