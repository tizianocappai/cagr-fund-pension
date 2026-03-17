import './index.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const stats = [
	{ emoji: '📈', label: 'CAGR', value: '8.4%', note: 'annualized return' },
	{
		emoji: '💰',
		label: 'Total invested',
		value: '€24,000',
		note: 'since 2019',
	},
	{
		emoji: '🏦',
		label: 'Current value',
		value: '€31,850',
		note: 'as of today',
	},
	{ emoji: '📅', label: 'Years active', value: '6', note: 'pension fund' },
];

const recentMovements = [
	{ emoji: '⬆️', label: 'Contribution', amount: '+€200', date: 'Mar 2026' },
	{ emoji: '📊', label: 'Rebalancing', amount: '—', date: 'Feb 2026' },
	{ emoji: '⬆️', label: 'Contribution', amount: '+€200', date: 'Feb 2026' },
	{ emoji: '⬇️', label: 'Fee', amount: '-€3.20', date: 'Jan 2026' },
];

export default function App() {
	return (
		<div className='min-h-screen bg-[--color-background] text-[--color-foreground]'>
			<div className='mx-auto max-w-2xl px-6 py-12'>
				{/* Header */}
				<header className='mb-10'>
					<p className='text-xs tracking-widest uppercase text-[--color-muted-foreground] mb-1'>
						Pension Dashboard
					</p>
					<h1 className='text-3xl font-semibold tracking-tight'>
						Fund overview 🗂️
					</h1>
					<p className='mt-2 text-sm text-[--color-muted-foreground]'>
						Tracking compound annual growth across your pension
						contributions.
					</p>
				</header>

				<Separator className='mb-8' />

				{/* Stats grid */}
				<section className='mb-8'>
					<h2 className='text-xs tracking-widest uppercase text-[--color-muted-foreground] mb-4'>
						Key metrics
					</h2>
					<div className='grid grid-cols-2 gap-3'>
						{stats.map((s) => (
							<Card key={s.label}>
								<CardHeader className='pb-2'>
									<CardDescription>
										{s.emoji} {s.label}
									</CardDescription>
									<CardTitle className='text-2xl'>
										{s.value}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className='text-xs text-[--color-muted-foreground]'>
										{s.note}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				<Separator className='mb-8' />

				{/* Recent movements */}
				<section className='mb-8'>
					<h2 className='text-xs tracking-widest uppercase text-[--color-muted-foreground] mb-4'>
						Recent movements
					</h2>
					<div className='divide-y divide-[--color-border] border border-[--color-border] rounded-[--radius]'>
						{recentMovements.map((m, i) => (
							<div
								key={i}
								className='flex items-center justify-between px-4 py-3'
							>
								<div className='flex items-center gap-3'>
									<span className='text-base'>{m.emoji}</span>
									<div>
										<p className='text-sm font-medium'>
											{m.label}
										</p>
										<p className='text-xs text-[--color-muted-foreground]'>
											{m.date}
										</p>
									</div>
								</div>
								<span className='text-sm font-mono'>
									{m.amount}
								</span>
							</div>
						))}
					</div>
				</section>

				<Separator className='mb-8' />

				{/* Status + actions */}
				<section className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Badge variant='outline'>🟢 Active</Badge>
						<Badge variant='secondary'>📋 Balanced</Badge>
					</div>
					<div className='flex gap-2'>
						<Button size='sm'>Export 📄</Button>
						<Button size='sm'>Add contribution ➕</Button>
					</div>
				</section>
			</div>
		</div>
	);
}
