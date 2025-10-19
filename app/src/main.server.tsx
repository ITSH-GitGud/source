import handler from '@tanstack/react-start/server-entry';

export default function fetch(request: Request): Response | Promise<Response> {
  return handler.fetch(request);
}
