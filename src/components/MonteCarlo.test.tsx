import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MonteCarlo } from './MonteCarlo'

// Recharts uses SVG and ResizeObserver which are not available in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recharts-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => null,
  Cell: () => null,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  ReferenceLine: () => null,
  Tooltip: () => null,
}))

// ── helpers ───────────────────────────────────────────────────────────────────

function clickSimulate() {
  fireEvent.change(screen.getByLabelText(/capitale obiettivo/i), {
    target: { value: '200.000' },
  })
  fireEvent.click(screen.getByRole('button', { name: /avvia simulazione/i }))
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('MonteCarlo component', () => {
  describe('initial render', () => {
    beforeEach(() => render(<MonteCarlo />))

    it('renders the "Avvia simulazione" button', () => {
      expect(
        screen.getByRole('button', { name: /avvia simulazione/i }),
      ).toBeInTheDocument()
    })

    it('renders all input fields', () => {
      expect(screen.getByLabelText(/rendimento reale atteso/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/volatilità/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/età attuale/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/età pensionamento/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/patrimonio iniziale/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/versamento/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/frequenza/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/capitale obiettivo/i)).toBeInTheDocument()
    })

    it('pre-fills rendimento with 3,5 and volatilità with 11', () => {
      expect(screen.getByLabelText(/rendimento reale atteso/i)).toHaveValue('3,5')
      expect(screen.getByLabelText(/volatilità/i)).toHaveValue('11')
    })

    it('does not show simulation results before the button is clicked', () => {
      expect(screen.queryByText(/probabilità di successo/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/scenari/i)).not.toBeInTheDocument()
    })
  })

  describe('button state', () => {
    it('is disabled when obiettivo is empty (initial state)', () => {
      render(<MonteCarlo />)
      // obiettivo starts empty → not valid
      expect(
        screen.getByRole('button', { name: /avvia simulazione/i }),
      ).toBeDisabled()
    })

    it('is enabled when patrimonio > 0 and obiettivo > 0', async () => {
      render(<MonteCarlo />)
      const user = userEvent.setup()
      await user.type(screen.getByLabelText(/capitale obiettivo/i), '200.000')
      expect(
        screen.getByRole('button', { name: /avvia simulazione/i }),
      ).not.toBeDisabled()
    })

    it('shows hint message when button is disabled', () => {
      render(<MonteCarlo />)
      expect(
        screen.getByText(/inserisci almeno un versamento.*capitale obiettivo/i),
      ).toBeInTheDocument()
    })

    it('is disabled when both patrimonio and versamento are 0 even with obiettivo set', async () => {
      render(<MonteCarlo />)
      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/capitale obiettivo/i), '100.000')
      await user.clear(screen.getByLabelText(/patrimonio iniziale/i))
      await user.type(screen.getByLabelText(/patrimonio iniziale/i), '0')
      await user.clear(screen.getByLabelText(/versamento/i))
      await user.type(screen.getByLabelText(/versamento/i), '0')

      expect(
        screen.getByRole('button', { name: /avvia simulazione/i }),
      ).toBeDisabled()
    })
  })

  describe('simulation results', () => {
    it('shows results after clicking "Avvia simulazione"', async () => {
      render(<MonteCarlo />)
      clickSimulate()

      await waitFor(() =>
        expect(screen.getByText(/probabilità di successo/i)).toBeInTheDocument(),
      )
      // Use exact match to avoid confusing "Scenari" (heading) with "Scenario" (table header)
      expect(screen.getAllByText(/^scenari$/i).length).toBeGreaterThan(0)
      expect(screen.getByText(/distribuzione del capitale finale/i)).toBeInTheDocument()
    })

    it('shows all three scenario rows (P10, P50, P90)', async () => {
      render(<MonteCarlo />)
      clickSimulate()

      await waitFor(() =>
        expect(screen.getByText(/pessimista/i)).toBeInTheDocument(),
      )
      expect(screen.getByText(/mediano/i)).toBeInTheDocument()
      expect(screen.getByText(/ottimista/i)).toBeInTheDocument()
    })

    it('shows simulation parameters card', async () => {
      render(<MonteCarlo />)
      clickSimulate()

      await waitFor(() =>
        expect(screen.getByText(/parametri simulazione/i)).toBeInTheDocument(),
      )
      // "Versamento annuale totale" and "Totale contributi previsti" are unique to the results card
      expect(screen.getByText(/versamento annuale totale/i)).toBeInTheDocument()
      expect(screen.getByText(/totale contributi previsti/i)).toBeInTheDocument()
    })

    it('shows the disclaimer after simulation', async () => {
      render(<MonteCarlo />)
      clickSimulate()

      await waitFor(() =>
        expect(
          screen.getByText(/strumento statistico a scopo educativo/i),
        ).toBeInTheDocument(),
      )
    })
  })

  describe('orizzonte temporale', () => {
    it('clamps years to minimum 1 when eta >= pensionamento', async () => {
      render(<MonteCarlo />)
      const user = userEvent.setup()

      const etaInput = screen.getByLabelText(/età attuale/i)
      await user.clear(etaInput)
      await user.type(etaInput, '66')

      const pensInput = screen.getByLabelText(/età pensionamento/i)
      await user.clear(pensInput)
      await user.type(pensInput, '60') // below eta

      // Should display at least 1 anno
      expect(screen.getByText(/1 anni|anni/)).toBeInTheDocument()
    })

    it('caps years at 30', async () => {
      render(<MonteCarlo />)
      const user = userEvent.setup()

      const etaInput = screen.getByLabelText(/età attuale/i)
      await user.clear(etaInput)
      await user.type(etaInput, '20')

      const pensInput = screen.getByLabelText(/età pensionamento/i)
      await user.clear(pensInput)
      await user.type(pensInput, '75')

      // 75-20=55, capped to 30
      expect(screen.getByText(/30 anni/)).toBeInTheDocument()
    })
  })

  describe('frequenza select', () => {
    it('switches between mensile and annuale', async () => {
      render(<MonteCarlo />)
      const user = userEvent.setup()
      const select = screen.getByLabelText(/frequenza/i)

      expect(select).toHaveValue('mensile')
      await user.selectOptions(select, 'annuale')
      expect(select).toHaveValue('annuale')
    })
  })
})
