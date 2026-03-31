import { useBudgetStore, LANAI_PRICES, type TierType, type RoomType, DEFAULT_ROOM_BASE_PRICES } from '../store/useBudgetStore'
import { formatCurrency } from '../lib/utils'
import { ContractTemplate } from './contracts/ContractTemplate'

export function PrintLayout({ mode }: { mode: 'client' | 'internal' | 'contract' | null }) {
  const { rooms, lanai, commissions, globalSettings, currentContractData } = useBudgetStore()
  if (!mode) return null

  const calculateRoomValue = (type: RoomType, tier: TierType) => {
    const base = globalSettings.roomBasePrices[type] || DEFAULT_ROOM_BASE_PRICES[type] || 0
    let factor = 0
    if (tier === 'basic') factor = -Math.abs(globalSettings.tierBasic) / 100
    if (tier === 'premium') factor = Math.abs(globalSettings.tierPremium) / 100
    
    return base * (1 + factor)
  }

  let roomsTotal = 0
  rooms.forEach(r => {
    const val = (r.customPrice !== undefined && r.customPrice !== null) ? r.customPrice : calculateRoomValue(r.type, r.tier)
    roomsTotal += val * r.quantity
  })

  let lanaiTotal = 0
  if (lanai.telao) lanaiTotal += (lanai.telaoCustomPrice ?? LANAI_PRICES.telao)
  if (lanai.summerKitchen) lanaiTotal += (lanai.summerKitchenCustomPrice ?? LANAI_PRICES.summerKitchen)
  if (lanai.telaPrivacidade) lanaiTotal += (lanai.telaPrivacidadeCustomPrice ?? LANAI_PRICES.telaPrivacidade)

  // Calcule Decoration Total (idêntico ao SummaryPanel)
  let decorationTotal = 0
  rooms.forEach(room => {
    const val = (room.customPrice !== undefined && room.customPrice !== null) 
      ? room.customPrice 
      : calculateRoomValue(room.type, room.tier)
    const roomTotal = val * room.quantity
    const decRate = (globalSettings.decorationPercent[room.type] || 0) / 100
    decorationTotal += (roomTotal * decRate)
  })

  const rawCmv = roomsTotal + lanaiTotal + decorationTotal
  const rates = globalSettings.commissionRates || { markup: 40, ingrid: 10, corretor: 10, tati: 2, indicacao: 5 }
  
  const markupValue = commissions.markup.enabled ? (rawCmv * rates.markup) / 100 : 0
  const subtotal = rawCmv + markupValue + (commissions.ingrid.enabled ? (rawCmv * rates.ingrid / 100) : 0)

  let deductions = 0
  if (commissions.corretor.enabled) deductions += (rates.corretor / 100)
  if (commissions.tati.enabled) deductions += (rates.tati / 100)
  if (commissions.indicacao.enabled) deductions += (rates.indicacao / 100)

  const sellPrice = deductions < 1 ? subtotal / (1 - deductions) : 0

  const ingridValue = commissions.ingrid.enabled ? (rawCmv * rates.ingrid) / 100 : 0
  const corretorValue = commissions.corretor.enabled ? (sellPrice * rates.corretor) / 100 : 0
  const tatiValue = commissions.tati.enabled ? (sellPrice * rates.tati) / 100 : 0
  const indicacaoValue = commissions.indicacao.enabled ? (sellPrice * rates.indicacao) / 100 : 0

  if (mode === 'contract') {
    return <ContractTemplate clientData={currentContractData} sellPrice={sellPrice} />
  }

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
             {mode === 'internal' && <span>{formatCurrency(calculateRoomValue(room.type, room.tier) * room.quantity)}</span>}
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
          {commissions.ingrid.enabled && <div className="flex justify-between py-1 text-sm"><span className="text-slate-600">Fee de Projeto ({rates.ingrid}%)</span><span className="font-medium text-emerald-600">+{formatCurrency(ingridValue)}</span></div>}
          
          <div className="my-3 border-t border-slate-200"></div>
          
          {commissions.corretor.enabled && <div className="flex justify-between py-1 text-sm"><span className="text-slate-600">Corretagem Base ({rates.corretor}%)</span><span className="font-medium text-rose-600">-{formatCurrency(corretorValue)}</span></div>}
          {commissions.tati.enabled && <div className="flex justify-between py-1 text-sm"><span className="text-slate-600">Fee Operacional ({rates.tati}%)</span><span className="font-medium text-rose-600">-{formatCurrency(tatiValue)}</span></div>}
          {commissions.indicacao.enabled && <div className="flex justify-between py-1 text-sm"><span className="text-slate-600">Indicação ({rates.indicacao}%)</span><span className="font-medium text-rose-600">-{formatCurrency(indicacaoValue)}</span></div>}
        </div>
      )}

      <div className="mt-12 p-6 bg-slate-900 rounded-2xl text-white flex justify-between items-center">
         <div>
           <h3 className="text-2xl font-bold">Investimento Total</h3>
           <p className="text-slate-400 text-sm mt-1">Valor estimado para entrega Turn-Key.</p>
         </div>
         <div className="text-3xl font-black">{formatCurrency(sellPrice)}</div>
      </div>
      
      <div className="mt-8 p-6 border-2 border-slate-100 rounded-2xl">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Condições de Pagamento</h3>
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="text-slate-500 mb-1">Entrada (Ato)</p>
            <p className="font-bold text-lg text-slate-900">50% — {formatCurrency(sellPrice * 0.5)}</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-500">Parcela 02 (30 dias) - 20%</span>
              <span className="font-semibold text-slate-900">{formatCurrency(sellPrice * 0.2)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-500">Parcela 03 (60 dias) - 20%</span>
              <span className="font-semibold text-slate-900">{formatCurrency(sellPrice * 0.2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Parcela 04 (90 dias) - 10%</span>
              <span className="font-semibold text-slate-900">{formatCurrency(sellPrice * 0.1)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-16 text-center text-xs text-slate-400">
        <p>Esta é uma estimativa gerada por software logístico e está sujeita a restrições de materiais, taxas estaduais, e revisão final da planta arquitetônica.</p>
        <p className="mt-1 font-bold">© NOHA. Todos os direitos reservados.</p>
      </div>
    </div>
  )
}
