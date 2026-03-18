export function Footer() {
	return (
		<footer className='border-t-2 border-[#0b0c0c] bg-[#f3f2f1] mt-12'>
			<div className='mx-auto max-w-4xl px-6 py-8'>
				<p className='text-sm text-muted-foreground mb-1'>
					I risultati hanno scopo puramente indicativo e non
					costituiscono consulenza finanziaria.
				</p>
				<p className='text-sm text-muted-foreground mb-4'>
					Nessun dato viene inviato a server esterni. Tutto il calcolo
					avviene localmente nel tuo browser.
				</p>
				<p className='text-sm text-muted-foreground'>
					Sviluppato da{' '}
					<a
						href='https://www.linkedin.com/in/tiziano-cappai-1b5271153/'
						target='_blank'
						rel='noopener noreferrer'
					>
						Cappai Tiziano
					</a>
				</p>
			</div>
		</footer>
	);
}
