//@ts-ignore May or may not be generated
import { routeTree } from '@gen/routeTree.gen';
import { createRouter } from '@tanstack/react-router';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types -- Auto-generated
export const getRouter = () => {
  return createRouter({
    routeTree,
    scrollRestoration: true,
  });
};
