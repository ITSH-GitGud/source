import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';

const Index = (): ReactElement => <h1>Home</h1>;

//@ts-ignore Auto-generated
export const Route = createFileRoute('/')({
  component: Index,
});
