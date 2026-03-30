import { useMemo } from 'react'
import { ShieldCheck, Zap, FlaskConical } from 'lucide-react'
import { getRoomBuffer, getCategoryRisks, CATEGORY_LABELS } from '../../lib/intelligence'
import { formatCurrency } from '../../lib/utils'
import { useBudgetStore, type RoomType } from '../../store/useBudgetStore'
import type { Category } from '../../data/historicalProjects'

interface RiskRadarProps {
  roomType: RoomType
  baseValue: number     // preço sem buffer (para detectar se já foi aplicado)
  currentValue: number  // preço atual (pode já ter buffer)
  onApplyBuffer: (newValue: number) => void
}

function CategoryRow({ category, deviation, isMocked, description }: {
  category: Category
  deviation: number
  isMocked: boolean
  description?: string
}) {
  const label = CATEGORY_LABELS[category]
  
  // No novo modelo: 
  // dev < 0 (economia/margem) = BOA (sky/emerald)
  // dev > 0 (gasto extra) = RISCO (amber/rose)
  const isHighRisk = deviation > 15
  const isWarning = deviation > 0

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          isHighRisk ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
        }`} />
        <span className="text-[10px] text-slate-600 flex-1 font-medium">{label}</span>
        {isMocked && <FlaskConical className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
        <span className={`text-[10px] font-black tabular-nums ${
          isHighRisk ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'
        }`}>
          {deviation > 0 ? '+' : ''}{deviation.toFixed(0)}%
        </span>
      </div>
      {description && (
        <p className="text-[9px] text-slate-400 pl-4 leading-tight">{description}</p>
      )}
    </div>
  )
}

export function RiskRadar({ roomType, baseValue, currentValue, onApplyBuffer }: RiskRadarProps) {
  const { globalSettings } = useBudgetStore()
  const { bufferPct, isMocked } = useMemo(() => getRoomBuffer(roomType), [roomType])
  const risks = useMemo(() => getCategoryRisks(), [])

  const decorationPct = globalSettings.decorationPercent[roomType] ?? 5

  // Preço que base teria com buffer aplicado
  const bufferedBaseValue = useMemo(() => Math.round(baseValue * (1 + bufferPct / 100)), [baseValue, bufferPct])

  // Buffer já aplicado: currentValue já está no nível do buffer ou acima
  const bufferAlreadyApplied = bufferPct > 0 && currentValue >= bufferedBaseValue

  // Top 5 categorias com maior desvio absoluto
  const topCategories = [...risks]
    .sort((a, b) => Math.abs(b.avgDeviation) - Math.abs(a.avgDeviation))
    .slice(0, 5)

  const categoryDescriptions: Partial<Record<Category, string>> = {
    CONSTRUCAO: 'Obra civil, piso, elétrica, hidráulica',
    MOVEIS: 'Mobiliário e Marcenaria sob medida',
    PRODUTOS: 'Amazon, acessórios, itens comprados',
    MAO_DE_OBRA: 'Marceneiro e instaladores',
    MAO_DE_OBRA_G: 'Equipe de gestão e coordenação',
    EXTRAS: 'Itens imprevistos ou fora do escopo',
    DECORACAO: `Acessórios e arte — ${decorationPct}% do CMV`,
    PACOTES_TEMATICOS: 'Cenários e itens de tematização',
  }

  return (
    <div className="mt-4 rounded-xl border p-4 bg-surface-warm border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent-intel" />
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70">
            Performance Histórica
          </span>
          {isMocked && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
              <FlaskConical className="w-2.5 h-2.5" /> estimado
            </span>
          )}
        </div>
        {/* Badge: respeita preço atual vs benchmark, não só dados históricos */}
        {currentValue < baseValue ? (
          <span className="text-[10px] font-black text-rose-600 px-2 py-0.5 bg-rose-50 rounded-full border border-rose-200">
            Abaixo da média ⚠️
          </span>
        ) : bufferPct > 0 ? (
          <span className="text-[10px] font-black text-amber-700 px-2 py-0.5 bg-amber-50 rounded-full border border-amber-200">
            Risco: +{bufferPct}%
          </span>
        ) : (
          <span className="text-[10px] font-black text-accent-intel px-2 py-0.5 bg-accent-intel/10 rounded-full">
            Margem OK ✓
          </span>
        )}
      </div>

      {/* Categorias históricas */}
      <div className="space-y-2 mb-3">
        {topCategories.map(cat => (
          <CategoryRow
            key={cat.category}
            category={cat.category}
            deviation={cat.avgDeviation}
            isMocked={cat.isMocked}
            description={categoryDescriptions[cat.category]}
          />
        ))}
      </div>

      {/* Preço já está Seguro ou Acima do Benchmark */}
      {currentValue >= baseValue && (
        <div className="mb-3 p-2 rounded-lg bg-white/70 border border-border flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-intel" />
          <p className="text-[10px] text-foreground/80 font-medium">
            Seu preço atual ({formatCurrency(currentValue)}) já está <span className="font-bold underline">acima da média</span> de mercado.
          </p>
        </div>
      )}

      {/* Botão Aplicar Buffer — Só aparece quando há risco real (bufferPct > 0) */}
      {bufferPct > 0 && currentValue < bufferedBaseValue && (
        <button
          type="button"
          onClick={() => onApplyBuffer(bufferedBaseValue)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all hover:shadow-sm ${
            currentValue >= baseValue 
              ? 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50' 
              : 'border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-200'
          } text-[11px] font-black uppercase tracking-widest`}
        >
          <span className="flex items-center gap-1.5">
            <Zap className="w-3 h-3" />
            {currentValue >= baseValue ? 'Proteção Extra (+5%)' : 'Garantir Margem'}
          </span>
          <span>
            {formatCurrency(bufferedBaseValue)}
            <span className="ml-1 opacity-70">
              ({currentValue >= baseValue ? 'Opcional' : `+${formatCurrency(bufferedBaseValue - currentValue)}`})
            </span>
          </span>
        </button>
      )}

      {/* Footer: só mostra confirmação positiva se currentValue >= baseValue */}
      {currentValue < baseValue ? (
        /* Preço custom está abaixo do benchmark — alerta claro */
        <div className="w-full flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] font-black text-rose-700 shadow-sm">
          <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            Preço {formatCurrency(currentValue)} está <span className="underline">{Math.round(((baseValue - currentValue) / baseValue) * 100)}% abaixo</span> da média histórica de {formatCurrency(baseValue)}. Risco real de margem.
          </span>
        </div>
      ) : (bufferAlreadyApplied || bufferPct === 0) ? (
        /* Tudo ok: preço está no nível certo OU sem risco histórico */
        <div className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-intel border border-accent-intel/80 text-[11px] font-black text-accent-intel-foreground shadow-sm">
          <span>🛡️</span>
          <span>{bufferPct === 0 ? 'Dados históricos confirmam: sem sobreriscos nesta categoria.' : 'Preço com blindagem total contra imprevistos.'}</span>
        </div>
      ) : null}
    </div>
  )
}
