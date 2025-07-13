import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css'; // 👈 this is where Tailwind comes from

createRoot(document.getElementById('root')!).render(<App />);
