import * as React from 'react';
import { useMeta } from '@/lib/useMeta';
import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { Alert, Divider, Input } from 'antd';
import { Card } from 'antd';
import { ChartTooltip } from '@/components/ui/chart-tooltip';
import { fmtEur, fmtEurRound, tickY } from '@/lib/formatters';
import { parseEur, parseRate } from '@/lib/parse';
import { chartColors } from '@/lib/chartColors';

// ── Simulation ─────────────────────────────────────────────────────────────────

function simulate(annualContrib: number, r: number, years: number): number {
	let balance = 0;
	for (let y = 0; y < years; y++)
		balance = (balance + annualContrib) * (1 + r);
	return balance;
}

// ── Chart ──────────────────────────────────────────────────────────────────────

interface ChartProps {
	annualContrib: number;
	r: number;
	anniAlPensionamento: number;
	anniPersi: number;
}

const GapChart = React.memo(function GapChart({
	annualContrib,
	r,
	anniAlPensionamento,
	anniPersi,
}: ChartProps) {
	const data = React.useMemo(() => {
		// "Ideale": balance had they started anniPersi years ago, then continues
		let ideale = simulate(annualContrib, r, anniPersi);
		// "Reale": starts at 0 today
		let reale = 0;

		const points = [
			{
				anno: 0,
				'Se avessi iniziato prima': Math.round(ideale),
				'Partendo da oggi': Math.round(reale),
			},
		];

		for (let y = 1; y <= anniAlPensionamento; y++) {
			ideale = (ideale + annualContrib) * (1 + r);
			reale = (reale + annualContrib) * (1 + r);
			points.push({
				anno: y,
				'Se avessi iniziato prima': Math.round(ideale),
				'Partendo da oggi': Math.round(reale),
			});
		}
		return points;
	}, [annualContrib, r, anniAlPensionamento, anniPersi]);

	const yMax =
		Math.ceil(data[data.length - 1]['Se avessi iniziato prima'] / 10_000) *
			10_000 || 10_000;

	return (
		<div
			role='img'
			aria-label='Grafico: crescita del capitale con e senza anticipo'
		>
			<ResponsiveContainer width='100%' height={320}>
				<AreaChart
					data={data}
					margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
				>
					<defs>
						<linearGradient
							id='gradIdeale'
							x1='0'
							y1='0'
							x2='0'
							y2='1'
						>
							<stop
								offset='5%'
								stopColor={chartColors.success}
								stopOpacity={0.15}
							/>
							<stop
								offset='95%'
								stopColor={chartColors.success}
								stopOpacity={0}
							/>
						</linearGradient>
						<linearGradient
							id='gradReale'
							x1='0'
							y1='0'
							x2='0'
							y2='1'
						>
							<stop
								offset='5%'
								stopColor={chartColors.primary}
								stopOpacity={0.15}
							/>
							<stop
								offset='95%'
								stopColor={chartColors.primary}
								stopOpacity={0}
							/>
						</linearGradient>
					</defs>
					<CartesianGrid stroke={chartColors.grid} strokeDasharray='4 2' />
					<XAxis
						dataKey='anno'
						tickFormatter={(v) => (v === 0 ? 'Oggi' : `+${v}y`)}
						tick={{ fontSize: 11, fill: chartColors.axis }}
						axisLine={false}
						tickLine={false}
					/>
					<YAxis
						domain={[0, yMax]}
						tickFormatter={tickY}
						tick={{ fontSize: 11, fill: chartColors.axis }}
						axisLine={false}
						tickLine={false}
						width={62}
					/>
					<Tooltip content={<ChartTooltip colorProp='stroke' />} />
					<Legend
						iconType='plainline'
						iconSize={16}
						wrapperStyle={{
							fontSize: 11,
							color: chartColors.axis,
							paddingTop: 8,
						}}
					/>
					<Area
						type='monotone'
						dataKey='Se avessi iniziato prima'
						stroke={chartColors.success}
						strokeWidth={2.5}
						fill='url(#gradIdeale)'
						dot={false}
						activeDot={{ r: 4 }}
					/>
					<Area
						type='monotone'
						dataKey='Partendo da oggi'
						stroke={chartColors.primary}
						strokeWidth={2.5}
						fill='url(#gradReale)'
						dot={false}
						activeDot={{ r: 4 }}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
});

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AnniPersi() {
	useMeta(
		'Quanto ti costano gli anni senza fondo pensione',
		'Calcola il costo reale di ogni anno trascorso senza versare nel fondo pensione complementare: contributi mancati e interessi composti perduti per sempre.',
	)
	const [ralInput, setRalInput] = React.useState('30.000');
	const [quotaAderenteInput, setQuotaAderenteInput] = React.useState('1,2');
	const [quotaAziendaInput, setQuotaAziendaInput] = React.useState('2');
	const [tassoInput, setTassoInput] = React.useState('4');
	const [anniPensioneInput, setAnniPensioneInput] = React.useState('30');
	const [anniPersiInput, setAnniPersiInput] = React.useState('5');

	const ral = parseEur(ralInput) || 0;
	const pctAderente = parseRate(quotaAderenteInput);
	const pctAzienda = parseRate(quotaAziendaInput);
	const tfrAnnuo = ral / 13.5;
	const aderAnnuo = ral * pctAderente;
	const aziAnnuo = ral * pctAzienda;
	const annualContrib = tfrAnnuo + aderAnnuo + aziAnnuo;
	const r = parseRate(tassoInput);
	const anniAlPensionamento = Math.min(
		Math.max(1, parseInt(anniPensioneInput) || 30),
		50,
	);
	const anniPersi = Math.min(Math.max(1, parseInt(anniPersiInput) || 5), 40);

	const capitaleIdeale = simulate(
		annualContrib,
		r,
		anniAlPensionamento + anniPersi,
	);
	const capitaleReale = simulate(annualContrib, r, anniAlPensionamento);
	const differenza = capitaleIdeale - capitaleReale;
	const costoPerAnno = differenza / anniPersi;
	const contributiNonVersati = annualContrib * anniPersi;
	const interessiPersi = differenza - contributiNonVersati;

	const valid = ral > 0;

	return (
		<div className='mx-auto max-w-4xl px-6 py-10'>
			<header className='mb-8'>
				<h1 className='text-[36px] leading-[44px] font-normal'>Anni persi</h1>
				<p className='mt-2 text-muted-foreground'>
					Ogni anno senza fondo pensione ha un costo reale. Scopri
					quanto ti è costato aspettare.
				</p>
			</header>

			<Alert
				type="info"
				showIcon
				className="mb-8"
				description={
					<p>
						Il tempo è la risorsa più preziosa negli investimenti.
						Grazie all'interesse composto, ogni anno in cui il tuo
						denaro non lavora non è solo un anno in meno di contributi —
						è un anno in meno di crescita su{' '}
						<strong>tutto il capitale già accumulato</strong>. Il
						ritardo si paga per decenni.
					</p>
				}
			/>

			<Divider className='mb-8' />

			{/* Inputs */}
			<div>
				<h2 className='text-[22px] leading-[28px] font-medium mb-4'>
					I tuoi dati
				</h2>
				<div className='grid grid-cols-3 gap-4 mb-2'>
					<div className='flex flex-col gap-1'>
						<label
							htmlFor='ral-ap'
							className='text-[12px] leading-[16px] tracking-[0.4px] tracking-widest uppercase text-muted-foreground'
						>
							RAL (€)
						</label>
						<Input
							id='ral-ap'
							value={ralInput}
							onChange={(e) => setRalInput(e.target.value)}
							placeholder='30.000'
							className='font-mono'
						/>
					</div>
					<div className='flex flex-col gap-1'>
						<label
							htmlFor='aderente-ap'
							className='text-[12px] leading-[16px] tracking-[0.4px] tracking-widest uppercase text-muted-foreground'
						>
							Quota aderente (% RAL)
						</label>
						<Input
							id='aderente-ap'
							value={quotaAderenteInput}
							onChange={(e) =>
								setQuotaAderenteInput(e.target.value)
							}
							placeholder='1,2'
							className='font-mono'
						/>
					</div>
					<div className='flex flex-col gap-1'>
						<label
							htmlFor='azienda-ap'
							className='text-[12px] leading-[16px] tracking-[0.4px] tracking-widest uppercase text-muted-foreground'
						>
							Quota azienda (% RAL)
						</label>
						<Input
							id='azienda-ap'
							value={quotaAziendaInput}
							onChange={(e) =>
								setQuotaAziendaInput(e.target.value)
							}
							placeholder='2'
							className='font-mono'
						/>
					</div>
					<div className='flex flex-col gap-1'>
						<label
							htmlFor='tasso-ap'
							className='text-[12px] leading-[16px] tracking-[0.4px] tracking-widest uppercase text-muted-foreground'
						>
							Rendimento annuo atteso (%)
						</label>
						<Input
							id='tasso-ap'
							value={tassoInput}
							onChange={(e) => setTassoInput(e.target.value)}
							placeholder='4'
							className='font-mono'
						/>
					</div>
					<div className='flex flex-col gap-1'>
						<label
							htmlFor='anni-pensione'
							className='text-[12px] leading-[16px] tracking-[0.4px] tracking-widest uppercase text-muted-foreground'
						>
							Anni al pensionamento
						</label>
						<Input
							id='anni-pensione'
							type='number'
							min={1}
							max={50}
							value={anniPensioneInput}
							onChange={(e) =>
								setAnniPensioneInput(e.target.value)
							}
							className='font-mono'
						/>
					</div>
					<div className='flex flex-col gap-1'>
						<label
							htmlFor='anni-persi'
							className='text-[12px] leading-[16px] tracking-[0.4px] tracking-widest uppercase text-muted-foreground'
						>
							Anni già passati senza fondo
						</label>
						<Input
							id='anni-persi'
							type='number'
							min={1}
							max={40}
							value={anniPersiInput}
							onChange={(e) => setAnniPersiInput(e.target.value)}
							className='font-mono'
						/>
					</div>
				</div>
				<p className='text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground mb-2'>
					Usa il formato italiano per la RAL: punto come separatore
					migliaia (es. 30.000).
				</p>
				{ral > 0 && (
					<Alert
						type="info"
						showIcon
						className="text-[12px] leading-[16px] tracking-[0.4px]"
						description={
							<div className="flex flex-col gap-0.5">
								<span>
									Contributo annuale totale:{' '}
									<strong>
										{fmtEurRound.format(Math.round(annualContrib))}
									</strong>
								</span>
								<span className='text-muted-foreground'>
									TFR: {fmtEurRound.format(Math.round(tfrAnnuo))} ·
									Aderente:{' '}
									{fmtEurRound.format(Math.round(aderAnnuo))} ·
									Azienda: {fmtEurRound.format(Math.round(aziAnnuo))}
								</span>
							</div>
						}
					/>
				)}
			</div>

			{valid && (
				<>
					<Divider className='my-8' />

					{/* Results */}
					<div>
						<h2 className='text-[22px] leading-[28px] font-medium mb-4'>
							Il costo del ritardo
						</h2>
						<div className='grid grid-cols-2 gap-3 mb-6'>
							<Card>
								<div className='pb-2'>
									<p className='text-[14px] leading-[20px] tracking-[0.25px] text-on-surface-variant'>
										Se avessi iniziato {anniPersi} anni fa
									</p>
									<div className='text-[28px] leading-[36px] font-bold'>
										{fmtEurRound.format(capitaleIdeale)}
									</div>
								</div>
								<p className='text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground'>
									capitale alla pensione — scenario ideale
								</p>
							</Card>
							<Card>
								<div className='pb-2'>
									<p className='text-[14px] leading-[20px] tracking-[0.25px] text-on-surface-variant'>
										Partendo da oggi
									</p>
									<div className='text-[28px] leading-[36px] font-bold'>
										{fmtEurRound.format(capitaleReale)}
									</div>
								</div>
								<p className='text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground'>
									capitale alla pensione — scenario reale
								</p>
							</Card>
							<Card>
								<div className='pb-2'>
									<p className='text-[14px] leading-[20px] tracking-[0.25px] text-on-surface-variant'>
										Capitale perso per il ritardo
									</p>
									<div className='text-[28px] leading-[36px] font-bold text-error'>
										{fmtEurRound.format(differenza)}
									</div>
								</div>
								<p className='text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground'>
									differenza tra i due scenari alla
									pensione
								</p>
							</Card>
							<Card>
								<div className='pb-2'>
									<p className='text-[14px] leading-[20px] tracking-[0.25px] text-on-surface-variant'>
										Costo medio per ogni anno perso
									</p>
									<div className='text-[28px] leading-[36px] font-bold text-error'>
										{fmtEur.format(costoPerAnno)}
									</div>
								</div>
								<p className='text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground'>
									di capitale finale bruciato per ogni
									anno di attesa
								</p>
							</Card>
						</div>

						<Alert
							type="error"
							showIcon
							className="text-[14px] leading-[20px] tracking-[0.25px]"
							description={
								<div className="flex flex-col gap-1">
									<p>
										Aspettare {anniPersi}{' '}
										{anniPersi === 1 ? 'anno' : 'anni'} ti costerà{' '}
										<strong>
											{fmtEurRound.format(differenza)}
										</strong>{' '}
										di capitale finale. Questo gap si compone di:
									</p>
									<ul className='list-disc pl-5 flex flex-col gap-0.5'>
										<li>
											<strong>
												{fmtEurRound.format(
													contributiNonVersati,
												)}
											</strong>{' '}
											di contributi mai versati ({anniPersi} ×{' '}
											{fmtEurRound.format(annualContrib)})
										</li>
										<li>
											<strong>
												{fmtEurRound.format(interessiPersi)}
											</strong>{' '}
											di interessi composti che quei contributi
											avrebbero generato fino alla pensione
										</li>
									</ul>
								</div>
							}
						/>
					</div>

					<Divider className='my-8' />

					{/* Chart */}
					<div>
						<h2 className='text-[22px] leading-[28px] font-medium mb-4'>
							Crescita del capitale da oggi
						</h2>
						<p className='text-[14px] leading-[20px] tracking-[0.25px] text-muted-foreground mb-5'>
							La linea verde parte già da{' '}
							{fmtEurRound.format(
								simulate(annualContrib, r, anniPersi),
							)}{' '}
							— il capitale che avresti accumulato se avessi
							iniziato {anniPersi} anni fa. Quella distanza
							iniziale si allarga ogni anno grazie all'interesse
							composto.
						</p>
						<GapChart
							annualContrib={annualContrib}
							r={r}
							anniAlPensionamento={anniAlPensionamento}
							anniPersi={anniPersi}
						/>
					</div>
				</>
			)}
		</div>
	);
}
