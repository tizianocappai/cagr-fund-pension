import { Link } from 'react-router';
import { Alert, Divider } from 'antd';
import { useMeta } from '@/lib/useMeta';

const features = [
	{
		to: '/rendimento-fondo',
		label: 'Rendimento Fondo Pensione',
		description:
			'Carica il file del tuo fondo e scopri il tasso di crescita medio annuo reale, calcolato con il metodo XIRR. Vedi quanto ha reso ogni anno, quanto hai versato e quanto ti è costato in commissioni.',
	},
	{
		to: '/fp-vs-tfr',
		label: 'FP vs TFR',
		description:
			'Confronta cosa succede al tuo TFR se rimane in azienda oppure viene versato nel fondo pensione. Calcolo netto con tassazione IRPEF 2026, tassazione separata TFR e aliquota agevolata del fondo pensione.',
	},
	{
		to: '/anni-persi',
		label: 'Anni persi',
		description:
			'Ogni anno senza fondo pensione ha un costo reale. Scopri quanto ti è costato aspettare, tra contributi mai versati e interessi composti perduti per sempre.',
	},
	{
		to: '/obiettivo',
		label: 'Come dovrei fare?',
		description:
			'Parti dal risultato che vuoi ottenere. Inserisci il capitale obiettivo, il rendimento atteso e gli anni a disposizione: la pagina ti dice quanto devi mettere da parte ogni anno — e ogni mese.',
	},
	{
		to: '/rischio-rendimento',
		label: 'Devo rischiare?',
		description:
			"Capire i comparti di investimento non è complicato. Questa sezione spiega la differenza tra azionario e obbligazionario, i rendimenti storici per ogni livello di rischio e include una simulazione Monte Carlo per visualizzare l'incertezza futura.",
	},
	{
		to: '/alternative',
		label: 'E Tu Fumi?',
		description:
			'Se non hai accesso a un fondo pensione — o vuoi affiancargli un piano autonomo — puoi replicare la stessa logica di allocazione usando due ETF a basso costo. Dati storici reali, scenari per ogni profilo di rischio e un confronto diretto sulla fiscalità.',
	},
];

export default function Missione() {
	useMeta(
		'Missione',
		'Gennaro: strumenti gratuiti per capire il tuo fondo pensione complementare. Calcola il rendimento reale, confronta TFR vs fondo pensione, simula il capitale futuro.',
	)
	return (
		<div className='mx-auto max-w-4xl px-6 py-10'>
			<header className='mb-8'>
				<h1 className='text-[36px] leading-[44px] font-normal'>Missione</h1>
				<p className='mt-2 text-muted-foreground'>
					Tutto quello che trovi su questo sito, spiegato in due
					righe.
				</p>
			</header>

			<Alert
				type="info"
				showIcon
				className="mb-8"
				description={
					<p>
						La maggior parte dei lavoratori italiani ha un fondo
						pensione, ma pochissimi sanno quanto rende davvero. Gennaro
						esiste per colmare quel vuoto: strumenti semplici, numeri
						veri, nessuna consulenza finanziaria — solo chiarezza.
					</p>
				}
			/>

			<Divider className='mb-8' />

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				{features.map((f) => (
					<Link
						key={f.to}
						to={f.to}
						className='flex flex-col gap-3 px-6 py-5 bg-surface-container elevation-1 rounded-md hover:elevation-2 transition-shadow duration-200 no-underline'
					>
						<h2 className='font-bold text-[16px] leading-[24px] tracking-[0.5px] text-primary'>
							{f.label}
						</h2>
						<p className='text-[14px] leading-[20px] tracking-[0.25px] text-on-surface-variant'>
							{f.description}
						</p>
					</Link>
				))}
			</div>

			<Divider className='mt-8 mb-6' />

			<p className='text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground leading-relaxed'>
				I risultati hanno scopo puramente indicativo. Per decisioni
				finanziarie personali consulta sempre un consulente finanziario
				indipendente.
			</p>
		</div>
	);
}
