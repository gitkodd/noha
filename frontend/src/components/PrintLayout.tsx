import { useBudgetStore, LANAI_PRICES, type TierType } from '../store/useBudgetStore'
import { formatCurrency } from '../lib/utils'

export function PrintLayout({ mode }: { mode: 'client' | 'internal' | null }) {
  const { rooms, lanai, commissions, globalSettings } = useBudgetStore()
  if (!mode) return null

  const getTierFactor = (tier: TierType) => {
    if (tier === 'basic') return globalSettings.tierBasic / 100
    if (tier === 'premium') return globalSettings.tierPremium / 100
    return 0
  }
  
  let roomsTotal = 0
  rooms.forEach(r => {
    const base = globalSettings.roomBasePrices[r.type] * (1 + getTierFactor(r.tier))
    roomsTotal += base * r.quantity
  })

  let lanaiTotal = 0
  if (lanai.telao) lanaiTotal += LANAI_PRICES.telao
  if (lanai.summerKitchen) lanaiTotal += LANAI_PRICES.summerKitchen
  if (lanai.telaPrivacidade) lanaiTotal += LANAI_PRICES.telaPrivacidade

  const rawCmv = roomsTotal + lanaiTotal
  const rates = globalSettings.commissionRates || { markup: 40, ingrid: 10, corretor: 10, tati: 2, indicacao: 5 }
  
  const markupValue = commissions.markup.enabled ? (rawCmv * rates.markup) / 100 : 0
  const indicacaoValue = commissions.indicacao.enabled ? (rawCmv * rates.indicacao) / 100 : 0
  const sellPrice = rawCmv + markupValue + indicacaoValue

  const ingridValue = commissions.ingrid.enabled ? (sellPrice * rates.ingrid) / 100 : 0
  const corretorValue = commissions.corretor.enabled ? (sellPrice * rates.corretor) / 100 : 0
  const tatiValue = commissions.tati.enabled ? (sellPrice * rates.tati) / 100 : 0

  return (
    <div className="hidden print:block w-full text-slate-900 bg-white min-h-screen p-8 absolute top-0 left-0 z-50">
      <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">NOHA</h1>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mt-1">
             Proposta Comercial / Estimate
          </p>
        </div>
        <div className="text-right text-sm text-slate-500">
          <p>Data: {new Date().toLocaleDateString('pt-BR')}</p>
          <p className="font-semibold text-slate-900 mt-1">{mode === 'internal' ? 'DOSSIÊ INTERNO (RESTrito)' : 'PROPOSTA CLIENTE'}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4">Escopo do Projeto</h2>
        {rooms.map(room => (
          <div key={room.id} className="flex justify-between py-2 border-b border-slate-100 text-sm">
             <span><span className="font-semibold">{room.quantity}x</span> {room.type} (Tier: {room.tier})</span>
             {mode === 'internal' && <span>{formatCurrency((globalSettings.roomBasePrices[room.type] * (1 + getTierFactor(room.tier))) * room.quantity)}</span>}
          </div>
        ))}
        {lanaiTotal > 0 && (
          <div className="flex justify-between py-2 border-b border-slate-100 text-sm mt-4">
            <span className="font-semibold">Amenities Externas (Lanai)</span>
            {mode === 'internal' && <span>{formatCurrency(lanaiTotal)}</span>}
          </div>
        )}
      </div>

      {mode === 'internal' && (
        <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h2 className="text-lg font-bold mb-4">Margens Internas & Fees</h2>
          <div className="flex justify-between py-1 text-sm"><span className="text-slate-600">Custo Base Agregado (CMV)</span><span className="font-medium">{formatCurrency(rawCmv)}</span></div>
          {commissions.markup.enabled && <div className="flex justify-between py-1 text-sm"><span className="text-slate-600">Markup Corporativo ({rates.markup}%)</span><span className="font-medium text-emerald-600">+{formatCurrency(markupValue)}</span></div>}
          {commissions.indicacao.enabled && <div className="flex justify-between py-1 text-sm"><span className="text-slate-600">Indicação Projeto ({rates.indicacao}%)</span><span className="font-medium text-emerald-600">+{formatCurrency(indicacaoValue)}</span></div>}
          
          <div className="my-3 border-t border-slate-200"></div>
          
          {commissions.ingrid.enabled && <div className="flex justify-between py-1 text-sm"><span className="text-slate-600">Fee de Projeto ({rates.ingrid}%)</span><span className="font-medium text-rose-600">-{formatCurrency(ingridValue)}</span></div>}
          {commissions.corretor.enabled && <div className="flex justify-between py-1 text-sm"><span className="text-slate-600">Corretagem Base ({rates.corretor}%)</span><span className="font-medium text-rose-600">-{formatCurrency(corretorValue)}</span></div>}
          {commissions.tati.enabled && <div className="flex justify-between py-1 text-sm"><span className="text-slate-600">Fee Operacional ({rates.tati}%)</span><span className="font-medium text-rose-600">-{formatCurrency(tatiValue)}</span></div>}
        </div>
      )}

      <div className="mt-12 p-6 bg-slate-900 rounded-2xl text-white flex justify-between items-center">
         <div>
           <h3 className="text-2xl font-bold">Investimento Total</h3>
           <p className="text-slate-400 text-sm mt-1">Valor estimado para entrega Turn-Key.</p>
         </div>
         <div className="text-3xl font-black">{formatCurrency(sellPrice)}</div>
      </div>
      
      <div className="mt-16 text-center text-xs text-slate-400">
        <p>Esta é uma estimativa gerada por software logístico e está sujeita a restrições de materiais, taxas estaduais, e revisão final da planta arquitetônica.</p>
        <p className="mt-1 font-bold">© NOHA. Todos os direitos reservados.</p>
      </div>
    </div>
  )
}
