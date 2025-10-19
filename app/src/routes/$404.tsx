import { createFileRoute } from '@tanstack/react-router';

const NotFound = () => <h1>Not Found</h1>;

//@ts-ignore Auto-generated
export const Route = createFileRoute('/$404')({
  component: NotFound,
});
