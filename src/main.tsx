import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import './index.css';
import { Footer } from './components/Footer.tsx';
import { Nav } from './components/Nav.tsx';
import RendimentoFondo from './pages/RendimentoFondo.tsx';
import CometaGuide from './pages/CometaGuide.tsx';
import FpVsTfr from './pages/FpVsTfr.tsx';
import Missione from './pages/Missione.tsx';
import CalcoloObiettivo from './pages/CalcoloObiettivo.tsx';
import { Analytics } from '@vercel/analytics/react';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { DisclaimerModal } from './components/DisclaimerModal.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<ErrorBoundary>
				<div className='flex min-h-screen flex-col'>
					<DisclaimerModal />
					<Nav />
					<main className='flex-1'>
						<Routes>
							<Route path='/' element={<RendimentoFondo />} />
							<Route
								path='/cometa-guide'
								element={<CometaGuide />}
							/>
							<Route path='/fp-vs-tfr' element={<FpVsTfr />} />
							<Route path='/obiettivo' element={<CalcoloObiettivo />} />
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
