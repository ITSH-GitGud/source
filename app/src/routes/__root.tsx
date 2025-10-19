import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';

const Root = () => {
  return (
    <html lang={'en'}>
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
};

export const Route = createRootRoute({
  head: () => {
    return {
      meta: [
        {
          charSet: 'utf-8',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          title: 'TanStack Start Starter',
        },
      ],
    };
  },
  component: Root,
});
