import { createRoot } from 'react-dom/client';
import Index from './pages/Index.tsx'; // ✅ point to your homepage

createRoot(document.getElementById("root")!).render(<Index />);
