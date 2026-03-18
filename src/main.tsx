import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import './index.css';
import { Footer } from './components/Footer.tsx';
import { Nav } from './components/Nav.tsx';
import Cometa from './pages/Cometa.tsx';
import CometaGuide from './pages/CometaGuide.tsx';
import Fonte from './pages/Fonte.tsx';
import FpVsTfr from './pages/FpVsTfr.tsx'
import Missione from './pages/Missione.tsx';
import { Analytics } from '@vercel/analytics/react';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<ErrorBoundary>
				<div className='flex min-h-screen flex-col'>
					<Nav />
					<main className='flex-1'>
						<Routes>
							<Route path='/' element={<Cometa />} />
							<Route path='/cometa' element={<Cometa />} />
							<Route path='/cometa-guide' element={<CometaGuide />} />
							<Route path='/fonte' element={<Fonte />} />
							<Route path='/fp-vs-tfr' element={<FpVsTfr />} />
							<Route path='/missione' element={<Missione />} />
						</Routes>
					</main>
					<Footer />
				</div>
				<Analytics />
			</ErrorBoundary>
		</BrowserRouter>
	</StrictMode>,
);
