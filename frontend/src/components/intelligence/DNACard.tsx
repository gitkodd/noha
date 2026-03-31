import { useMemo } from 'react'
import { Dna, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import { useBudgetStore, LANAI_PRICES, DEFAULT_ROOM_BASE_PRICES, type RoomType } from '../../store/useBudgetStore'
import { getSimilarProjects } from '../../lib/intelligence'
import { formatCurrency } from '../../lib/utils'

// Badge de desvio adaptado para fundo escuro
function DeviationBadge({ pct }: { pct: number }) {
  if (Math.abs(pct) < 2) return (
    <span className="inline-flex items-center gap-1 text-white/50 text-[11px] font-bold">
      <Minus className="w-3 h-3" /> No prazo
    </span>
  )
  if (pct > 0) return (
    <span className="inline-flex items-center gap-1 text-rose-400 text-[11px] font-bold">
      <TrendingUp className="w-3 h-3" /> +{pct.toFixed(1)}%
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
      <TrendingDown className="w-3 h-3" /> {pct.toFixed(1)}%
    </span>
  )
}

const MEDALS = ['🥇', '🥈', '🥉']

export function DNACard() {
  const { rooms, lanai, globalSettings } = useBudgetStore()

  const config = useMemo(() => {
    const thematicCount = rooms.filter(r => r.type === 'Quarto Temático').reduce((s, r) => s + r.quantity, 0)
    const adultCount = rooms.filter(r => r.type === 'Quarto Normal').reduce((s, r) => s + r.quantity, 0)
    const loftCount = rooms.filter(r => r.type === 'Loft').reduce((s, r) => s + r.quantity, 0)
    const gameRoomCount = rooms.filter(r => r.type === 'Garagem' || r.type === 'Cinema').reduce((s, r) => s + r.quantity, 0)
    const hasLanai = lanai.telao || lanai.summerKitchen || lanai.telaPrivacidade

    const estimatedCMV = rooms.reduce((sum, room) => {
      const base = globalSettings.roomBasePrices[room.type as RoomType] || DEFAULT_ROOM_BASE_PRICES[room.type as RoomType] || 0
      const price = room.customPrice ?? base
      return sum + price * room.quantity
    }, 0)
      + (lanai.telao ? LANAI_PRICES.telao : 0)
      + (lanai.summerKitchen ? LANAI_PRICES.summerKitchen : 0)
      + (lanai.telaPrivacidade ? LANAI_PRICES.telaPrivacidade : 0)

    return { thematicCount, adultCount, loftCount, gameRoomCount, hasLanai, estimatedCMV }
  }, [rooms, lanai, globalSettings])

  const similar = useMemo(() => getSimilarProjects(config), [config])

  const totalRooms = config.thematicCount + config.adultCount + config.loftCount + config.gameRoomCount

  // Sem cômodos: mostra prompt sutil
  if (rooms.length === 0) return (
    <div className="flex items-start gap-2.5 text-white/30">
      <Dna className="w-4 h-4 mt-0.5 shrink-0" />
      <p className="text-[11px] font-medium leading-snug">
        DNA do Projeto: adicione cômodos para ver projetos históricos similares.
      </p>
    </div>
  )

  // Cômodos adicionados mas nenhum similar encontrado
  if (similar.length === 0) return (
    <div className="flex items-start gap-2.5 text-white/30">
      <Info className="w-4 h-4 mt-0.5 shrink-0" />
      <p className="text-[11px] font-medium leading-snug">
        Nenhum projeto similar encontrado para esta configuração ainda.
      </p>
    </div>
  )

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-accent-intel/20 border border-accent-intel/30 flex items-center justify-center">
          <Dna className="w-3.5 h-3.5 text-accent-intel" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-accent-intel">DNA do Projeto</p>
          <p className="text-[9px] text-white/40 font-medium">
            {totalRooms} cômodo{totalRooms !== 1 ? 's' : ''} · {similar.length} similar{similar.length !== 1 ? 'es' : ''} encontrado{similar.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Cards de similares */}
      <div className="space-y-2">
        {similar.map(({ project, score, reasons }, idx) => {
          const deviationPct = project.totalPriceCost > 0
            ? (((project.totalActualCost ?? 0) - project.totalPriceCost) / project.totalPriceCost) * 100
            : 0

          // Cor da barra de score — no dark context usa accent-intel para alta, primary para média
          const barColor = score >= 70 ? 'bg-accent-intel' : score >= 40 ? 'bg-primary' : 'bg-white/20'

          return (
            <div
              key={project.id}
              className="bg-white/5 hover:bg-white/8 rounded-xl border border-white/10 p-3 space-y-2 transition-colors"
            >
              {/* Nome + score */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm leading-none shrink-0">{MEDALS[idx]}</span>
                  <span className="font-black text-white text-sm truncate">{project.name}</span>
                  {/* isMocked removido do schema — campo não existe mais */}
                </div>
                {/* Barra de score */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden" style={{ width: '36px' }}>
                    <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${score}%` }} />
                  </div>
                  <span className="text-[11px] font-black text-accent-intel">{score}%</span>
                </div>
              </div>

              {/* Tags de razões */}
              {reasons.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {reasons.slice(0, 3).map(r => (
                    <span key={r} className="text-[9px] font-bold uppercase tracking-wide text-primary/80 bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full">
                      {r}
                    </span>
                  ))}
                </div>
              )}

              {/* CMV comparativo */}
              <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/5">
                <div>
                  <p className="text-[8px] text-white/30 uppercase tracking-wider font-bold mb-0.5">Orçado</p>
                  <p className="text-[10px] font-black text-white/70">{formatCurrency(project.totalPriceCost)}</p>
                </div>
                <div>
                  <p className="text-[8px] text-white/30 uppercase tracking-wider font-bold mb-0.5">Real</p>
                  <p className="text-[10px] font-black text-white/70">{formatCurrency(project.totalActualCost ?? 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-white/30 uppercase tracking-wider font-bold mb-0.5">Desvio</p>
                  <DeviationBadge pct={deviationPct} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Nota footer */}
      <p className="text-[9px] text-white/25 leading-snug">
        Score baseado em nº de cômodos, temáticos, Loft, Game Room e Lanai.
      </p>
    </div>
  )
}
