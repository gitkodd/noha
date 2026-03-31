import { useMemo, useEffect } from 'react'
import { X, Dna, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import { useBudgetStore, LANAI_PRICES, DEFAULT_ROOM_BASE_PRICES, type RoomType } from '../../store/useBudgetStore'
import { getSimilarProjects } from '../../lib/intelligence'
import { formatCurrency } from '../../lib/utils'

function DeviationBadge({ pct }: { pct: number }) {
  if (Math.abs(pct) < 2) return (
    <span className="inline-flex items-center gap-1 text-foreground/50 text-[11px] font-bold">
      <Minus className="w-3 h-3" /> No prazo
    </span>
  )
  if (pct > 0) return (
    <span className="inline-flex items-center gap-1 text-rose-600 text-[11px] font-bold">
      <TrendingUp className="w-3 h-3" /> +{pct.toFixed(1)}% acima
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px] font-bold">
      <TrendingDown className="w-3 h-3" /> {pct.toFixed(1)}% abaixo
    </span>
  )
}

const MEDALS = ['🥇', '🥈', '🥉']

interface DNADrawerProps {
  open: boolean
  onClose: () => void
}

export function DNADrawer({ open, onClose }: DNADrawerProps) {
  const { rooms, lanai, globalSettings } = useBudgetStore()

  // Fechar com ESC
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Bloquear scroll do body
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

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

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer panel — surface warm: off-white areia, coerente com a identidade visual */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-surface-warm shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Accent line top — mesma que o SummaryPanel usa, mas dourado */}
        <div className="h-1 w-full bg-accent-intel shrink-0" />

        {/* Header do drawer */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-intel flex items-center justify-center shadow-sm">
              <Dna className="w-4 h-4 text-accent-intel-foreground" />
            </div>
            <div>
              <h2 className="font-black text-foreground tracking-tight">DNA do Projeto</h2>
              <p className="text-[11px] text-foreground/50 font-medium">
                {rooms.length === 0
                  ? 'Adicione cômodos para ver comparações'
                  : `${totalRooms} cômodo${totalRooms !== 1 ? 's' : ''} configurado${totalRooms !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-foreground/40 hover:text-foreground hover:bg-border/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Estado vazio */}
          {rooms.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-border/60 flex items-center justify-center">
                <Dna className="w-6 h-6 text-foreground/25" />
              </div>
              <p className="text-foreground/40 text-sm font-medium max-w-xs">
                Adicione cômodos no configurador para ver quais projetos históricos mais se parecem com o que você está montando.
              </p>
            </div>
          )}

          {/* Sem similares */}
          {rooms.length > 0 && similar.length === 0 && (
            <div className="flex items-start gap-3 bg-white/60 rounded-2xl p-4 border border-border">
              <Info className="w-4 h-4 text-foreground/40 mt-0.5 shrink-0" />
              <p className="text-sm text-foreground/50">
                Nenhum projeto histórico encontrado com perfil próximo ao desta configuração.
              </p>
            </div>
          )}

          {/* Composição atual */}
          {rooms.length > 0 && (
            <div className="bg-white/70 rounded-2xl border border-primary/20 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Composição Atual</p>
              <div className="grid grid-cols-2 gap-2">
                {config.thematicCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎨</span>
                    <div>
                      <p className="text-xs font-black text-foreground">{config.thematicCount}x Temáticos</p>
                    </div>
                  </div>
                )}
                {config.adultCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🛏️</span>
                    <div>
                      <p className="text-xs font-black text-foreground">{config.adultCount}x Adulto</p>
                    </div>
                  </div>
                )}
                {config.loftCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏗️</span>
                    <div>
                      <p className="text-xs font-black text-foreground">{config.loftCount}x Loft</p>
                    </div>
                  </div>
                )}
                {config.gameRoomCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎮</span>
                    <div>
                      <p className="text-xs font-black text-foreground">{config.gameRoomCount}x Game Room</p>
                    </div>
                  </div>
                )}
                {config.hasLanai && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌿</span>
                    <div>
                      <p className="text-xs font-black text-foreground">Com Lanai</p>
                    </div>
                  </div>
                )}
              </div>
              {config.estimatedCMV > 0 && (
                <div className="mt-3 pt-3 border-t border-primary/15">
                  <p className="text-[9px] text-primary/70 uppercase tracking-wider font-bold">CMV Estimado</p>
                  <p className="text-lg font-black text-foreground">{formatCurrency(config.estimatedCMV)}</p>
                </div>
              )}
            </div>
          )}

          {/* Lista de similares */}
          {similar.length > 0 && (
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Projetos Mais Similares</p>

              {similar.map(({ project, score, reasons }, idx) => {
                const deviationPct = project.totalPriceCost > 0
                  ? (((project.totalActualCost ?? 0) - project.totalPriceCost) / project.totalPriceCost) * 100
                  : 0

                // Barra de score: accent-intel para alta, primary para média, border para baixa
                const barColor = score >= 70
                  ? 'bg-accent-intel'
                  : score >= 40
                  ? 'bg-primary'
                  : 'bg-border'

                return (
                  <div key={project.id} className="bg-white/70 rounded-2xl border border-border shadow-sm p-5 space-y-4">
                    {/* Nome e score */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{MEDALS[idx]}</span>
                        <div>
                          <p className="font-black text-foreground">{project.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-accent-intel">{score}%</p>
                        <p className="text-[9px] text-foreground/40 uppercase tracking-wider font-bold">similar</p>
                      </div>
                    </div>

                    {/* Barra de score */}
                    <div className="h-1.5 bg-border/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>

                    {/* Razões de similaridade */}
                    {reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {reasons.map(r => (
                          <span key={r} className="text-[10px] font-bold uppercase tracking-wide bg-primary/10 text-foreground/70 px-2.5 py-1 rounded-full border border-primary/20">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Composição do projeto */}
                    <div className="grid grid-cols-2 gap-2 bg-surface-warm rounded-xl p-3">
                      <div>
                        <p className="text-[8px] text-foreground/40 uppercase tracking-wider font-bold">Temáticos</p>
                        <p className="text-sm font-black text-foreground">{project.thematicCount}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-foreground/40 uppercase tracking-wider font-bold">Adulto</p>
                        <p className="text-sm font-black text-foreground">{project.adultCount}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-foreground/40 uppercase tracking-wider font-bold">Loft / Game Room</p>
                        <p className="text-sm font-black text-foreground">{project.loftCount + project.gameRoomCount}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-foreground/40 uppercase tracking-wider font-bold">Lanai</p>
                        <p className="text-sm font-black text-foreground">{project.hasLanai ? '✅ Sim' : '❌ Não'}</p>
                      </div>
                    </div>

                    {/* CMV orçado vs real */}
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                      <div>
                        <p className="text-[9px] text-foreground/40 uppercase tracking-wider font-bold mb-1">CMV Orçado</p>
                        <p className="text-sm font-black text-foreground">{formatCurrency(project.totalPriceCost)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-foreground/40 uppercase tracking-wider font-bold mb-1">CMV Real</p>
                        <p className="text-sm font-black text-foreground">{formatCurrency(project.totalActualCost ?? 0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-foreground/40 uppercase tracking-wider font-bold mb-1">Desvio</p>
                        <DeviationBadge pct={deviationPct} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border shrink-0">
          <p className="text-[10px] text-foreground/40 leading-relaxed">
            Score calculado por: nº de cômodos, temáticos, Loft, Game Room, Lanai e faixa de CMV.
            Scores ≥ 70% indicam projetos muito próximos em perfil e escala.
          </p>
        </div>
      </div>
    </>
  )
}
