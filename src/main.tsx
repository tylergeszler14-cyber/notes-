import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import CafePage from './CafePage.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CafePage />
  </StrictMode>,
);
