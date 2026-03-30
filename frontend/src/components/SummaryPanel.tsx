import { useMemo, useState } from 'react'
import { Card, CardContent } from './ui/Card'
import { useBudgetStore, LANAI_PRICES, type TierType } from '../store/useBudgetStore'
import { formatCurrency } from '../lib/utils'
import { DNADrawer } from './intelligence/DNADrawer'
import { Dna } from 'lucide-react'

export function SummaryPanel() {
  const { rooms, lanai, commissions, globalSettings } = useBudgetStore()
  const [showDNA, setShowDNA] = useState(false)
  const rates = globalSettings.commissionRates || { markup: 40, ingrid: 10, corretor: 10, tati: 2, indicacao: 5 }

  const {
    roomsTotal,
    decoration,
    lanaiTotal,
    cmv,
    markupValue,
    ingridValue,
    subtotal,
    sellPrice,
    corretorValue,
    tatiValue,
    indicacaoValue,
    grossMargin
  } = useMemo(() => {
    // Helper to get tier multiplier
    const getTierFactor = (tier: TierType) => {
      if (tier === 'basic') return -Math.abs(globalSettings.tierBasic) / 100
      if (tier === 'premium') return Math.abs(globalSettings.tierPremium) / 100
      return 0
    }

    // 1. Rooms
    const rTotal = rooms.reduce((acc, room) => {
      let current = 0;
      if (room.customPrice !== undefined && room.customPrice !== null) {
        current = room.customPrice;
      } else {
        const base = globalSettings.roomBasePrices[room.type]
        current = base * (1 + getTierFactor(room.tier))
      }
      return acc + (current * room.quantity)
    }, 0)

    // 2. Decoration (Per Room Calculus)
    const dec = rooms.reduce((acc, room) => {
      let current = 0;
      if (room.customPrice !== undefined && room.customPrice !== null) {
        current = room.customPrice;
      } else {
        const base = globalSettings.roomBasePrices[room.type]
        current = base * (1 + getTierFactor(room.tier))
      }
      const roomTotal = current * room.quantity
      const decRate = globalSettings.decorationPercent[room.type] / 100
      return acc + (roomTotal * decRate)
    }, 0)

    // 3. Lanai
    let lTotal = 0
    if (lanai.telao) lTotal += LANAI_PRICES.telao
    if (lanai.summerKitchen) lTotal += LANAI_PRICES.summerKitchen
    if (lanai.telaPrivacidade) lTotal += LANAI_PRICES.telaPrivacidade

    // 4. CMV
    const cmvValue = rTotal + dec + lTotal

    // 5. Markup and Ingrid
    const mkpValue = commissions.markup.enabled ? cmvValue * (rates.markup / 100) : 0
    const ingValue = commissions.ingrid.enabled ? cmvValue * (rates.ingrid / 100) : 0

    // 6. Subtotal
    const sub = cmvValue + mkpValue + ingValue

    // 7. Sell Price calculation (reverse using correct mathematical deduction margin formula)
    let deductions = 0
    if (commissions.corretor.enabled) deductions += (rates.corretor / 100)
    if (commissions.tati.enabled) deductions += (rates.tati / 100)
    if (commissions.indicacao.enabled) deductions += (rates.indicacao / 100)

    // Protect divide by zero mapping
    const sp = deductions < 1 ? sub / (1 - deductions) : 0

    // 8. Absolute values of Venda commissions based on standard sell price computation strategy
    const corValue = commissions.corretor.enabled ? sp * (rates.corretor / 100) : 0
    const tatValue = commissions.tati.enabled ? sp * (rates.tati / 100) : 0
    const indValue = commissions.indicacao.enabled ? sp * (rates.indicacao / 100) : 0

    // Gross Margin
    const profit = sp - cmvValue - corValue - tatValue - indValue - ingValue
    const gm = sp > 0 ? (profit / sp) * 100 : 0

    return {
      roomsTotal: rTotal,
      decoration: dec,
      lanaiTotal: lTotal,
      cmv: cmvValue,
      markupValue: mkpValue,
      ingridValue: ingValue,
      subtotal: sub,
      sellPrice: sp,
      corretorValue: corValue,
      tatiValue: tatValue,
      indicacaoValue: indValue,
      grossMargin: gm
    }
  }, [rooms, lanai, commissions, globalSettings, rates])

  return (
    <>
    <Card className="w-full bg-slate-900 text-white border-none shadow-2xl overflow-hidden sticky top-24 max-h-[calc(100vh-7rem)] flex flex-col">
      <div className="h-1.5 w-full bg-primary shrink-0"></div>
      
      <div className="p-6 sm:p-8 pb-5 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent shrink-0">
        <h3 className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] mb-2 sm:mb-3">Preço de Venda Sugerido</h3>
        <p className="text-4xl sm:text-5xl font-light tracking-tight text-white mb-4 sm:mb-5">
          {formatCurrency(sellPrice)}
        </p>
        <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1.5 text-[10px] sm:text-xs font-semibold text-primary-foreground ring-1 ring-inset ring-primary/30 shadow-sm">
          Margem Bruta (Ref.): {grossMargin.toFixed(1)}%
        </span>
      </div>
      
      <CardContent className="p-6 sm:p-8 space-y-5 sm:space-y-6 text-sm overflow-y-auto hide-scrollbar">
        <div className="space-y-3">
          <div className="flex justify-between text-white/60 hover:text-white transition-colors">
            <span className="tracking-wide">Total Cômodos</span>
            <span>{formatCurrency(roomsTotal)}</span>
          </div>
          <div className="flex justify-between text-white/60 hover:text-white transition-colors">
            <span className="tracking-wide">Decoração (Variável)</span>
            <span>{formatCurrency(decoration)}</span>
          </div>
          <div className="flex justify-between text-white/60 hover:text-white transition-colors">
            <span className="tracking-wide">Lanai</span>
            <span>{formatCurrency(lanaiTotal)}</span>
          </div>
          <div className="flex justify-between font-semibold text-emerald-400 pt-3 border-t border-white/10">
            <span className="tracking-widest uppercase text-xs">Custos Estruturais CMV</span>
            <span>{formatCurrency(cmv)}</span>
          </div>
        </div>

        <div className="space-y-3 pt-6 border-t border-white/10">
          {commissions.markup.enabled && (
             <div className="flex justify-between text-white/60 hover:text-white transition-colors">
               <span className="tracking-wide">Markup ({rates.markup}%)</span>
               <span>{formatCurrency(markupValue)}</span>
             </div>
          )}
          {commissions.ingrid.enabled && (
             <div className="flex justify-between text-white/60 hover:text-white transition-colors">
               <span className="tracking-wide">Fee Projeto ({rates.ingrid}%)</span>
               <span>{formatCurrency(ingridValue)}</span>
             </div>
          )}
          <div className="flex justify-between font-semibold text-white pt-3 border-t border-white/10">
            <span className="tracking-widest uppercase text-xs">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>

        <div className="space-y-3 pt-6 border-t border-white/10">
          {commissions.corretor.enabled && (
             <div className="flex justify-between text-white/60 hover:text-white transition-colors">
               <span className="tracking-wide">Corretagem ({rates.corretor}%)</span>
               <span className="text-red-300">-{formatCurrency(corretorValue)}</span>
             </div>
          )}
          {commissions.tati.enabled && (
             <div className="flex justify-between text-white/60 hover:text-white transition-colors">
               <span className="tracking-wide">Fee Operacional ({rates.tati}%)</span>
               <span className="text-red-300">-{formatCurrency(tatiValue)}</span>
             </div>
          )}
          {commissions.indicacao.enabled && (
             <div className="flex justify-between text-white/60 hover:text-white transition-colors">
               <span className="tracking-wide">Indicação ({rates.indicacao}%)</span>
               <span className="text-red-300">-{formatCurrency(indicacaoValue)}</span>
             </div>
          )}
        </div>

        {/* Botão DNA */}
        <div className="pt-5 border-t border-white/10">
          <button
            onClick={() => setShowDNA(true)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-accent-intel/15 hover:bg-accent-intel/25 border border-accent-intel/25 hover:border-accent-intel/40 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-accent-intel/20 border border-accent-intel/30 flex items-center justify-center">
                <Dna className="w-3.5 h-3.5 text-accent-intel" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-accent-intel">DNA do Projeto</p>
                <p className="text-[9px] text-white/40 font-medium">
                  {rooms.length === 0 ? 'Adicione cômodos para comparar' : `${rooms.length} cômodo${rooms.length !== 1 ? 's' : ''} · ver similares`}
                </p>
              </div>
            </div>
            <span className="text-white/30 group-hover:text-white/60 text-xs transition-colors">→</span>
          </button>
        </div>
      </CardContent>
    </Card>

    {/* Drawer fora do card para renderizar sobre tudo */}
    <DNADrawer open={showDNA} onClose={() => setShowDNA(false)} />
  </>
  )
}
