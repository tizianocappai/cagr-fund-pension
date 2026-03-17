import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import './index.css';
import { Footer } from './components/Footer.tsx';
import { Nav } from './components/Nav.tsx';
import Cometa from './pages/Cometa.tsx';
import CometaGuide from './pages/CometaGuide.tsx';
import { Analytics } from '@vercel/analytics/react';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<div className='flex min-h-screen flex-col'>
				<Nav />
				<main className='flex-1'>
					<Routes>
						<Route path='/' element={<Cometa />} />
						<Route path='/cometa' element={<Cometa />} />
						<Route path='/cometa-guide' element={<CometaGuide />} />
					</Routes>
				</main>
				<Footer />
			</div>
			<Analytics />
		</BrowserRouter>
	</StrictMode>,
);
