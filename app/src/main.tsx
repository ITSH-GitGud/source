import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { StartClient } from '@tanstack/react-start/client';

const App = <StartClient />;

hydrateRoot(
  document,
  import.meta.env.DEV ? <StrictMode>{App}</StrictMode> : App,
);
