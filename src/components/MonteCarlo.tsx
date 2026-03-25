import * as React from 'react';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip as RechartsTooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { Alert, Button, Input } from 'antd';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tooltip } from 'antd';
import { fmtEurRound } from '@/lib/formatters';
import { parseEur, parseRate } from '@/lib/parse';
import { N_SIMULAZIONI, runSimulation, type SimResult } from '@/lib/monteCarlo';
import { chartColors } from '@/lib/chartColors';

const DEFAULT_RENDIMENTO = '3,5';

/** FV of initial capital + regular annual contributions at rate r. */
function fvOfContribs(pv: number, pmt: number, n: number, r: number): number {
	if (Math.abs(r) < 1e-10) return pv + pmt * n;
	const g = Math.pow(1 + r, n);
	return pv * g + pmt * (g - 1) / r;
}

/** Implied annual CAGR (bisection) for a given final value. Returns null if unsolvable. */
function impliedCAGR(pv: number, pmt: number, n: number, fv: number): number | null {
	if (fv <= 0 || n <= 0) return null;
	let lo = -0.5, hi = 5.0;
	for (let i = 0; i < 120; i++) {
		const mid = (lo + hi) / 2;
		const diff = fvOfContribs(pv, pmt, n, mid) - fv;
		if (Math.abs(diff) < 0.5) return mid;
		if (diff > 0) hi = mid; else lo = mid;
	}
	return (lo + hi) / 2;
}
const DEFAULT_VOLATILITA = '11';

// ── Histogram tooltip ─────────────────────────────────────────────────────────

function HistoTooltip({
	active,
	payload,
}: {
	active?: boolean;
	payload?: { payload: SimResult['histogram'][number] }[];
}) {
	if (!active || !payload?.length) return null;
	const d = payload[0].payload;
	return (
		<div className='border border-border bg-white px-3 py-2 text-[12px] leading-[16px] tracking-[0.4px] shadow'>
			<p className='text-muted-foreground'>{d.label}</p>
			<p className='font-semibold'>{d.count} simulazioni</p>
		</div>
	);
}

// ── Main component ────────────────────────────────────────────────────────────

export function MonteCarlo() {
	const [etaInput, setEtaInput] = React.useState('35');
	const [pensInput, setPensInput] = React.useState('67');
	const [patrimInput, setPatrimInput] = React.useState('10.000');
	const [versInput, setVersInput] = React.useState('300');
	const [frequenza, setFrequenza] = React.useState<'mensile' | 'annuale'>('mensile');
	const [rendimentoInput, setRendimentoInput] = React.useState(DEFAULT_RENDIMENTO);
	const [volatilitaInput, setVolatilitaInput] = React.useState(DEFAULT_VOLATILITA);
	const [obiettivoInput, setObiettivoInput] = React.useState('');

	const eta = Math.min(64, Math.max(18, parseInt(etaInput) || 35));
	const pensionamento = Math.min(75, Math.max(eta + 1, parseInt(pensInput) || 67));
	const years = Math.min(30, Math.max(1, pensionamento - eta));
	const initialCap = parseEur(patrimInput);
	const versamento = parseEur(versInput);
	const annualContrib = frequenza === 'mensile' ? versamento * 12 : versamento;
	const rendimento = parseRate(rendimentoInput);
	const volatilita = parseRate(volatilitaInput);
	const obiettivo = parseEur(obiettivoInput);

	const [sim, setSim] = React.useState<SimResult | null>(null);
	const [loading, setLoading] = React.useState(false);

	const valid = (initialCap > 0 || annualContrib > 0) && years > 0 && obiettivo > 0;

	function simulate() {
		if (!valid) return;
		setLoading(true);
		setTimeout(() => {
			setSim(runSimulation(initialCap, annualContrib, years, rendimento, volatilita, obiettivo));
			setLoading(false);
		}, 0);
	}

	const successColor = !sim
		? chartColors.axis
		: sim.successRate >= 70
			? chartColors.success
			: sim.successRate >= 40
				? chartColors.warning
				: chartColors.error;

	return (
		<div className='flex flex-col gap-6'>
			{/* Parameters callout */}
			<Alert type="info" showIcon description={
				<>
					<p className='font-semibold mb-2'>Parametri del modello</p>
					<p className='text-[14px] leading-[20px] tracking-[0.25px] leading-relaxed mb-2'>
						I valori sono espressi in termini <strong>reali</strong>,
						già al netto dell'inflazione. I default riflettono un fondo
						pensione bilanciato europeo tipico (rendimento reale ~3,5%,
						volatilità ~11%), in linea con i dati storici di lungo
						periodo. Fonte:{' '}
						<a href='https://www.covip.it/per-gli-operatori/fondi-pensione/costi-e-rendimenti-dei-fondi-pensione/elenco-dei-rendimenti' target='_blank' rel='noopener noreferrer'>
							COVIP — Rendimenti dei fondi pensione
						</a>
						{'; '}
						<a href='https://www.credit-suisse.com/about-us/en/reports-research/global-investment-returns-yearbook.html' target='_blank' rel='noopener noreferrer'>
							Dimson-Marsh-Staunton, Global Investment Returns Yearbook
						</a>
						. Puoi modificare i parametri per rispecchiare il tuo comparto.
					</p>
					<p className='text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground'>
						I rendimenti passati non garantiscono quelli futuri.
					</p>
				</>
			} />

			{/* Inputs */}
			<div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
				<div className='flex flex-col gap-1'>
					<label htmlFor='mc-rendimento' className='text-[12px] leading-[16px] tracking-[0.4px] tracking-widest uppercase text-muted-foreground'>
						Rendimento reale atteso (%)
					</label>
					<Input
						id='mc-rendimento'
						value={rendimentoInput}
						onChange={(e) => setRendimentoInput(e.target.value)}
						placeholder={DEFAULT_RENDIMENTO}
						className='font-mono'
					/>
				</div>
				<div className='flex flex-col gap-1'>
					<label htmlFor='mc-volatilita' className='text-[12px] leading-[16px] tracking-[0.4px] tracking-widest uppercase text-muted-foreground'>
						Volatilità — std dev (%)
					</label>
					<Input
						id='mc-volatilita'
						value={volatilitaInput}
						onChange={(e) => setVolatilitaInput(e.target.value)}
						placeholder={DEFAULT_VOLATILITA}
						className='font-mono'
					/>
				</div>
				<div className='flex flex-col gap-1'>
					<label
						htmlFor='mc-eta'
						className='text-[12px] leading-[16px] tracking-[0.4px] tracking-widest uppercase text-muted-foreground'
					>
						Età attuale
					</label>
					<Input
						id='mc-eta'
						type='number'
						min={18}
						max={64}
						value={etaInput}
						onChange={(e) => setEtaInput(e.target.value)}
						className='font-mono'
					/>
				</div>
				<div className='flex flex-col gap-1'>
					<label
						htmlFor='mc-pens'
						className='text-[12px] leading-[16px] tracking-[0.4px] tracking-widest uppercase text-muted-foreground'
					>
						Età pensionamento
					</label>
					<Input
						id='mc-pens'
						type='number'
						min={eta + 1}
						max={75}
						value={pensInput}
						onChange={(e) => setPensInput(e.target.value)}
						className='font-mono'
					/>
				</div>
				<div className='flex flex-col gap-1'>
					<label
						htmlFor='mc-anni'
						className='text-[12px] leading-[16px] tracking-[0.4px] tracking-widest uppercase text-muted-foreground'
					>
						Orizzonte temporale
					</label>
					<div className='h-14 flex items-center border border-outline bg-surface px-4 font-mono text-[16px] leading-[24px] tracking-[0.5px] rounded-sm'>
						{years} anni
					</div>
				</div>
				<div className='flex flex-col gap-1'>
					<label
						htmlFor='mc-patrim'
						className='text-[12px] leading-[16px] tracking-[0.4px] tracking-widest uppercase text-muted-foreground'
					>
						Patrimonio iniziale (€)
					</label>
					<Input
						id='mc-patrim'
						value={patrimInput}
						onChange={(e) => setPatrimInput(e.target.value)}
						placeholder='10.000'
						className='font-mono'
					/>
				</div>
				<div className='flex flex-col gap-1'>
					<label
						htmlFor='mc-vers'
						className='text-[12px] leading-[16px] tracking-[0.4px] tracking-widest uppercase text-muted-foreground'
					>
						Versamento (€)
					</label>
					<Input
						id='mc-vers'
						value={versInput}
						onChange={(e) => setVersInput(e.target.value)}
						placeholder='300'
						className='font-mono'
					/>
				</div>
				<div className='flex flex-col gap-1'>
					<label
						htmlFor='mc-freq'
						className='text-[12px] leading-[16px] tracking-[0.4px] tracking-widest uppercase text-muted-foreground'
					>
						Frequenza
					</label>
					<select
						id='mc-freq'
						value={frequenza}
						onChange={(e) =>
							setFrequenza(
								e.target.value as 'mensile' | 'annuale',
							)
						}
						className='h-14 border border-outline bg-surface px-4 text-[16px] leading-[24px] tracking-[0.5px] rounded-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 appearance-none cursor-pointer transition-colors duration-200'
					>
						<option value='mensile'>Mensile</option>
						<option value='annuale'>Annuale</option>
					</select>
				</div>
			</div>

			{/* Target capital */}
			<div className='flex flex-col gap-1'>
				<label htmlFor='mc-obiettivo' className='text-[12px] leading-[16px] tracking-[0.4px] tracking-widest uppercase text-muted-foreground'>
					Capitale obiettivo (€)
				</label>
				<Input
					id='mc-obiettivo'
					value={obiettivoInput}
					onChange={(e) => setObiettivoInput(e.target.value)}
					placeholder='es. 300.000'
					className='font-mono max-w-xs'
				/>
				<p className='text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground'>
					Il capitale che vuoi raggiungere al pensionamento. La simulazione calcola la probabilità di superarlo.
				</p>
			</div>

			<div>
				<Button type="primary" onClick={simulate} disabled={!valid || loading}>
					{loading ? 'Simulazione in corso…' : 'Avvia simulazione'}
				</Button>
				{!valid && (
					<p className='mt-2 text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground'>
						Inserisci almeno un versamento o un patrimonio iniziale, e un capitale obiettivo.
					</p>
				)}
			</div>

			{valid && sim && (
				<>
					{/* Probability */}
					<div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
						<Card className='sm:col-span-1'>
							<CardHeader className='pb-2'>
								<CardDescription>
									<Tooltip title="Percentuale di simulazioni in cui il capitale finale supera il tuo capitale obiettivo. Sopra il 70% è considerato solido; tra 40–70% accettabile; sotto il 40% richiede attenzione.">
										<span className='border-b border-dashed border-current cursor-help'>
											Probabilità di successo
										</span>
									</Tooltip>
								</CardDescription>
								<CardTitle
									className='text-[57px] leading-[64px] tracking-[-0.25px] font-normal'
									style={{ color: successColor }}
								>
									{sim.successRate.toFixed(1)}%
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className='text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground'>
									su {N_SIMULAZIONI.toLocaleString('it-IT')}{' '}
									simulazioni — obiettivo{" "}
									<span className="font-mono font-medium text-foreground">{fmtEurRound.format(sim.target)}</span>
								</p>
							</CardContent>
						</Card>

						<Card className='sm:col-span-2'>
							<CardHeader className='pb-2'>
								<CardDescription>
									Parametri simulazione
								</CardDescription>
							</CardHeader>
							<CardContent className='text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground flex flex-col gap-1'>
								<div className='flex justify-between'>
									<span>Orizzonte temporale</span>
									<span className='font-mono font-medium text-foreground'>
										{years} anni ({eta} → {pensionamento}{' '}
										anni)
									</span>
								</div>
								<div className='flex justify-between'>
									<span>Versamento annuale totale</span>
									<span className='font-mono font-medium text-foreground'>
										{fmtEurRound.format(annualContrib)}
									</span>
								</div>
								<div className='flex justify-between'>
									<span>Totale contributi previsti</span>
									<span className='font-mono font-medium text-foreground'>
										{fmtEurRound.format(sim.totalVersato)}
									</span>
								</div>
								<div className='flex justify-between'>
									<span>Capitale obiettivo</span>
									<span className='font-mono font-medium text-foreground'>
										{fmtEurRound.format(sim.target)}
									</span>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Scenario table */}
					<div>
						<p className='text-[22px] leading-[28px] font-medium mb-1'>
							Scenari
						</p>
						<p className='text-[14px] leading-[20px] tracking-[0.25px] text-muted-foreground mb-3'>
							<Tooltip title='Un percentile indica la percentuale di simulazioni che si trovano al di sotto di quel valore. Il 10° percentile significa che il 90% delle simulazioni ha ottenuto un risultato migliore — è lo scenario peggiore realistico.'>
								<span className='border-b border-dashed border-current cursor-help'>
									Cosa sono i percentili?
								</span>
							</Tooltip>
						</p>
						<div className='border border-border overflow-x-auto'>
							<table className='w-full text-[14px] leading-[20px] tracking-[0.25px]'>
								<thead>
									<tr className='border-b border-border bg-muted'>
										<th className='px-3 py-2 text-left font-medium text-muted-foreground'>
											Scenario
										</th>
										<th className='px-3 py-2 text-right font-medium text-muted-foreground'>
											Capitale finale
										</th>
										<th className='px-3 py-2 text-right font-medium text-muted-foreground'>
											Contributi versati
										</th>
										<th className='px-3 py-2 text-right font-medium text-muted-foreground'>
											Rendimento generato
										</th>
										<th className='px-3 py-2 text-right font-medium text-muted-foreground'>
											Tasso annuo equivalente
										</th>
									</tr>
								</thead>
								<tbody>
									{(
										[
											{
												label: 'Pessimista (P10°)',
												value: sim.p10,
												color: chartColors.error,
											},
											{
												label: 'Mediano (P50°)',
												value: sim.p50,
												color: chartColors.axis,
											},
											{
												label: 'Ottimista (P90°)',
												value: sim.p90,
												color: chartColors.success,
											},
										] as const
									).map((s, i) => {
										const cagr = impliedCAGR(initialCap, annualContrib, years, s.value);
										return (
										<tr
											key={s.label}
											className={
												i % 2 === 0
													? 'bg-card'
													: 'bg-muted'
											}
										>
											<td
												className='px-3 py-2 font-medium'
												style={{ color: s.color }}
											>
												{s.label}
											</td>
											<td className='px-3 py-2 text-right font-mono font-semibold'>
												{fmtEurRound.format(s.value)}
											</td>
											<td className='px-3 py-2 text-right font-mono text-muted-foreground'>
												{fmtEurRound.format(
													sim.totalVersato,
												)}
											</td>
											<td
												className='px-3 py-2 text-right font-mono'
												style={{
													color:
														s.value -
															sim.totalVersato >=
														0
															? chartColors.success
															: chartColors.error,
												}}
											>
												{s.value - sim.totalVersato >= 0
													? '+'
													: ''}
												{fmtEurRound.format(
													s.value - sim.totalVersato,
												)}
											</td>
											<td
												className='px-3 py-2 text-right font-mono font-semibold'
												style={{ color: s.color }}
											>
												{cagr !== null
													? `${(cagr * 100).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
													: '—'}
											</td>
										</tr>
									)})}
								</tbody>
							</table>
						</div>
					</div>

					{/* Histogram */}
					<div>
						<p className='text-[22px] leading-[28px] font-medium mb-1'>
							Distribuzione del capitale finale
						</p>
						<p className='text-[14px] leading-[20px] tracking-[0.25px] text-muted-foreground mb-4'>
							Ogni barra mostra quante simulazioni hanno prodotto
							un capitale finale in quell'intervallo. Le barre{' '}
							<strong className='text-error'>rosse</strong> sono
							sotto l'obiettivo, quelle{' '}
							<strong style={{ color: chartColors.success }}>verdi</strong>{' '}
							lo superano. La linea tratteggiata segna l'obiettivo
							({fmtEurRound.format(sim.target)}).
						</p>
						<div
							role='img'
							aria-label='Istogramma: distribuzione del capitale finale nelle simulazioni Monte Carlo'
						>
							<ResponsiveContainer width='100%' height={240}>
								<BarChart
									data={sim.histogram}
									margin={{
										top: 4,
										right: 8,
										bottom: 0,
										left: 0,
									}}
									barCategoryGap='2%'
								>
									<CartesianGrid
										stroke={chartColors.grid}
										strokeDasharray='4 2'
										vertical={false}
									/>
									<XAxis
										dataKey='label'
										tick={{ fontSize: 10, fill: chartColors.axis }}
										axisLine={false}
										tickLine={false}
										interval={4}
									/>
									<YAxis
										tickFormatter={(v) => `${v}`}
										tick={{ fontSize: 10, fill: chartColors.axis }}
										axisLine={false}
										tickLine={false}
										width={40}
									/>
									<RechartsTooltip
										content={<HistoTooltip />}
										cursor={{ fill: 'rgba(0,0,0,0.05)' }}
									/>
									{(() => {
										// Find the histogram index closest to target for ReferenceLine
										const targetIdx =
											sim.histogram.findIndex(
												(b) => b.aboveTarget,
											);
										return targetIdx > 0 ? (
											<ReferenceLine
												x={
													sim.histogram[targetIdx]
														.label
												}
												stroke={chartColors.axis}
												strokeDasharray='4 2'
												strokeWidth={2}
												label={{
													value: 'Obiettivo',
													position: 'insideTopRight',
													fontSize: 10,
													fill: chartColors.axis,
												}}
											/>
										) : null;
									})()}
									<Bar
										dataKey='count'
										radius={0}
										maxBarSize={40}
									>
										{sim.histogram.map((b, i) => (
											<Cell
												key={i}
												fill={
													b.aboveTarget
														? chartColors.success
														: chartColors.error
												}
												fillOpacity={0.75}
											/>
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Disclaimer */}
					<Alert type="error" showIcon description={
						<p className='text-[12px] leading-[16px] tracking-[0.4px] leading-relaxed'>
							La simulazione Monte Carlo è uno strumento statistico a
							scopo educativo. I risultati dipendono dalle ipotesi di
							rendimento e volatilità e non costituiscono previsioni
							né consulenza finanziaria. Le performance future possono
							differire significativamente da quelle simulate.
						</p>
					} />
				</>
			)}
		</div>
	);
}
