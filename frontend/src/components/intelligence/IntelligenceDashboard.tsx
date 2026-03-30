import { useMemo } from 'react'
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  BarChart3, Layers, FlaskConical, Target, DollarSign
} from 'lucide-react'
import { getDashboardKPIs } from '../../lib/intelligence'
import { formatCurrency } from '../../lib/utils'
import type { CategoryRisk } from '../../lib/intelligence'

// ─── Helpers ────────────────────────────────────────────────────────────────

function riskColor(deviation: number) {
  // dev < 0 = Economia (Azul/Verde)
  // dev > 0 = Gasto Extra (Amarelo/Vermelho)
  if (deviation > 20) return { bg: 'bg-rose-50', text: 'text-rose-700', bar: 'bg-rose-500', border: 'border-rose-200' }
  if (deviation > 0) return { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-400', border: 'border-amber-200' }
  if (deviation > -10) return { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500', border: 'border-emerald-200' }
  return { bg: 'bg-sky-50', text: 'text-sky-700', bar: 'bg-sky-500', border: 'border-sky-200' }
}

function DeviationBar({ deviation }: { deviation: number }) {
  const colors = riskColor(deviation)
  const maxBar = 40
  const width = Math.min(Math.abs(deviation) / maxBar * 100, 100)
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colors.bar}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className={`text-[11px] font-black w-14 text-right ${colors.text}`}>
        {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%
      </span>
    </div>
  )
}

function KPICard({
  icon: Icon, label, value, sub, color = 'intel'
}: {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
  color?: 'intel' | 'rose' | 'emerald' | 'amber'
}) {
  const colors = {
    intel: 'bg-accent-intel shadow-accent-intel/20',
    rose: 'bg-rose-500 shadow-rose-200',
    emerald: 'bg-emerald-500 shadow-emerald-200',
    amber: 'bg-amber-500 shadow-amber-200',
  }
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm mb-3 ${colors[color]}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      {sub && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Componente Principal ────────────────────────────────────────────────────

export function IntelligenceDashboard() {
  const kpis = useMemo(() => getDashboardKPIs(), [])

  const sortedCategories: CategoryRisk[] = [...kpis.categoryRisks].sort(
    (a, b) => b.avgDeviation - a.avgDeviation
  )

  const hasMockedData = kpis.projectComparisons.some(p => p.isMocked)

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-accent-intel flex items-center justify-center shadow-sm shadow-accent-intel/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Central de Inteligência</h2>
              <p className="text-xs text-slate-500 font-medium">
                Baseado em {kpis.totalProjects} projetos · {formatCurrency(kpis.projectComparisons.reduce((s, p) => s + p.priceCost, 0))} em dados históricos
              </p>
            </div>
          </div>
        </div>

        {/* Badge de mock */}
        {hasMockedData && (
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full shrink-0">
            <FlaskConical className="w-3 h-3 text-amber-600" />
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
              Inclui dados estimados
            </span>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={DollarSign}
          label="CMV Médio / Projeto"
          value={formatCurrency(kpis.avgProjectCost)}
          sub={`${kpis.totalProjects} projetos`}
          color="intel"
        />
        <KPICard
          icon={kpis.avgDeviation > 0 ? TrendingUp : TrendingDown}
          label="Desvio Médio"
          value={`${kpis.avgDeviation > 0 ? '+' : ''}${kpis.avgDeviation.toFixed(1)}%`}
          sub="real vs. orçado"
          color={kpis.avgDeviation > 15 ? 'rose' : kpis.avgDeviation > 5 ? 'amber' : 'emerald'}
        />
        <KPICard
          icon={Target}
          label="Quarto Temático"
          value={formatCurrency(kpis.thematicRoomAvgCost)}
          sub="custo médio / unidade"
          color="emerald"
        />
        <KPICard
          icon={Layers}
          label="Quarto Adulto"
          value={formatCurrency(kpis.adultRoomAvgCost)}
          sub="custo médio / unidade"
          color="amber"
        />
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CMV Orçado vs Real */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-accent-intel" />
            <h3 className="font-black text-sm uppercase tracking-widest text-slate-700">CMV Orçado vs. Real</h3>
          </div>

          <div className="space-y-4">
            {kpis.projectComparisons
              .filter(p => p.priceCost > 0)
              .sort((a, b) => b.priceCost - a.priceCost)
              .map(project => {
                const maxCost = Math.max(...kpis.projectComparisons.map(p => p.actualCost))
                const widthPrice = (project.priceCost / maxCost) * 100
                const widthActual = (project.actualCost / maxCost) * 100
                const colors = riskColor(project.deviationPct)
                return (
                  <div key={project.name} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-800">{project.name}</span>
                        {project.isMocked && (
                          <FlaskConical className="w-3 h-3 text-amber-400" aria-label="Dados estimados" />
                        )}
                      </div>
                      <div className={`text-[11px] font-black px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                        {project.deviationPct > 0 ? '+' : ''}{project.deviationPct.toFixed(1)}%
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-400 w-12 text-right font-bold uppercase">Orçado</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-300 rounded-full" style={{ width: `${widthPrice}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 w-20 text-right">{formatCurrency(project.priceCost)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-400 w-12 text-right font-bold uppercase">Real</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${widthActual}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 w-20 text-right">{formatCurrency(project.actualCost)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Histórico por Categoria */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Target className="w-4 h-4 text-accent-intel" />
            <h3 className="font-black text-sm uppercase tracking-widest text-slate-700">Margem por Categoria</h3>
          </div>

          <div className="space-y-4">
            {sortedCategories.map(cat => {
              const colors = riskColor(cat.avgDeviation)
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-700">{cat.label}</span>
                      {cat.isMocked && (
                        <FlaskConical className="w-3 h-3 text-amber-400" aria-label="Dados estimados" />
                      )}
                    </div>
                    {cat.avgDeviation > 15
                      ? <AlertTriangle className={`w-3.5 h-3.5 ${colors.text}`} />
                      : <CheckCircle2 className={`w-3.5 h-3.5 ${colors.text}`} />
                    }
                  </div>
                  <div className="flex items-center gap-3">
                    <DeviationBar deviation={cat.avgDeviation} />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {cat.avgDeviation > 15 && '⚠️ Variação crítica — Exige buffer de segurança'}
                    {cat.avgDeviation > 0 && cat.avgDeviation <= 15 && '🟡 Gasto levemente acima do orçado'}
                    {cat.avgDeviation <= 0 && cat.avgDeviation > -10 && '✅ Performance estável dentro da margem'}
                    {cat.avgDeviation <= -10 && '🔵 Margem alta — Custo real significativamente menor'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Nota sobre os dados */}
      <div className="flex items-start gap-3 bg-surface-warm border border-primary/20 rounded-2xl p-4 text-sm">
        <CheckCircle2 className="w-4 h-4 text-accent-intel mt-0.5 shrink-0" />
        <div>
          <p className="font-bold text-foreground mb-0.5">Sincronizado com Noha 2.0</p>
          <p className="text-foreground/60 text-xs leading-relaxed">
            Dados extraídos diretamente das planilhas operacionais (BD1). Esta engine reflete o custo real (Actual Cost) 
            em comparação ao orçamento previsto (Price Cost) para garantir a saúde financeira dos projetos.
          </p>
        </div>
      </div>
    </div>
  )
}
