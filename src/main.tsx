import { createRoot } from 'react-dom/client';

import { App } from './App';
import { FinanceProvider } from './store/financeStore';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <FinanceProvider>
    <App />
  </FinanceProvider>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => undefined);
  });
}
