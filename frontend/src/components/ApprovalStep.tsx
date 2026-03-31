import { useState } from 'react'
import { Card, CardContent } from './ui/Card'
import { useBudgetStore, LANAI_PRICES, DEFAULT_ROOM_BASE_PRICES, type TierType, type RoomType } from '../store/useBudgetStore'
import { formatCurrency } from '../lib/utils'
import { CheckCircle2, Home, Trees, Briefcase, FileText, DownloadCloud, RefreshCw, PenTool } from 'lucide-react'
import { ComboManager } from './ComboManager'
import { ContractFormModal } from './contracts/ContractFormModal'
import { useProjectStore } from '../store/useProjectStore'

export function ApprovalStep() {
  const { rooms, lanai, globalSettings } = useBudgetStore()

  const getTierFactor = (tier: TierType) => {
    if (tier === 'basic') return (globalSettings.tierBasic || 0) / 100
    if (tier === 'premium') return (globalSettings.tierPremium || 0) / 100
    return 0
  }

  const getLanaiActive = () => {
    const active = []
    if (lanai.telao) active.push({ name: 'Telão Integrado', price: LANAI_PRICES.telao })
    if (lanai.summerKitchen) active.push({ name: 'Summer Kitchen Premium', price: LANAI_PRICES.summerKitchen })
    if (lanai.telaPrivacidade) active.push({ name: 'Tela de Privacidade', price: LANAI_PRICES.telaPrivacidade })
    return active
  }

  return (
    <div className="space-y-10">
      <Card className="w-full border-none shadow-xl bg-white rounded-2xl overflow-hidden">
        <div className="bg-emerald-50/50 border-b border-emerald-100/50 p-6 sm:p-8 flex items-start sm:items-center gap-4">
          <div className="bg-emerald-100 text-emerald-600 rounded-2xl p-3 shadow-sm shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-medium tracking-tight text-emerald-950 mb-1">Revisão Analítica do Orçamento</h2>
            <p className="text-emerald-700/70 text-sm font-medium">Confira a lista de itens, valores e módulos antes de formalizar o combo.</p>
          </div>
        </div>

        <CardContent className="p-0">
          {/* Ambientes */}
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <Home className="w-4 h-4 text-primary" /> Extrato de Módulos (Cômodos)
            </h3>
            {rooms.length === 0 ? (
              <p className="text-slate-400 text-sm italic font-medium bg-slate-50 p-4 rounded-xl">O escopo está vazio. Retorne à primeira etapa.</p>
            ) : (
              <ul className="space-y-3">
                {rooms.map(room => {
                  // Fallback para o preço padrão caso a configuração no navegador esteja desatualizada
                  const base = globalSettings.roomBasePrices[room.type] || DEFAULT_ROOM_BASE_PRICES[room.type] || 0
                  const current = base * (1 + getTierFactor(room.tier))
                  const total = current * room.quantity
                  return (
                    <li key={room.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-primary/20 transition-colors">
                      <div className="flex items-center">
                        <span className="font-semibold text-slate-800">{room.quantity}x {room.type}</span>
                        <span className="ml-3 px-2.5 py-1 bg-white border border-slate-200 text-slate-500 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm">
                          Tier: {room.tier}
                        </span>
                      </div>
                      <span className="font-medium text-slate-900 mt-2 sm:mt-0 text-lg">{formatCurrency(total)}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="p-6 sm:p-8 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <Trees className="w-4 h-4 text-primary" /> Adicionais Lanai
            </h3>
            {getLanaiActive().length === 0 ? (
              <p className="text-slate-400 text-sm italic font-medium bg-slate-50 p-4 rounded-xl">Nenhuma amenity externa inserida.</p>
            ) : (
              <ul className="space-y-2">
                {getLanaiActive().map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between p-3 border-b border-slate-50 last:border-0">
                    <span className="text-slate-600 font-medium">{item.name}</span>
                    <span className="text-slate-900 font-semibold">{formatCurrency(item.price)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <ExportPDFsMock />
      <ComboManager />
    </div>
  )
}

function ExportPDFsMock() {
  const [exporting, setExporting] = useState<'client' | 'internal' | 'contract' | null>(null)
  const [success, setSuccess] = useState<'client' | 'internal' | 'contract' | null>(null)
  const [isContractModalOpen, setIsContractModalOpen] = useState(false)
  
  const { rooms, lanai, commissions, globalSettings, setPrintMode, setCurrentContractData } = useBudgetStore()
  const { updateProject, selectedProjectId } = useProjectStore()

  const calculateRoomValue = (type: RoomType, tier: TierType) => {
    const base = globalSettings.roomBasePrices[type] || DEFAULT_ROOM_BASE_PRICES[type] || 0
    let factor = 0
    if (tier === 'basic') factor = -Math.abs(globalSettings.tierBasic) / 100
    if (tier === 'premium') factor = Math.abs(globalSettings.tierPremium) / 100
    return base * (1 + factor)
  }

  let roomsTotal = 0
  rooms.forEach(r => {
    const val = r.customPrice ?? calculateRoomValue(r.type, r.tier)
    roomsTotal += val * r.quantity
  })

  let lanaiTotal = 0
  if (lanai.telao) lanaiTotal += (lanai.telaoCustomPrice ?? LANAI_PRICES.telao)
  if (lanai.summerKitchen) lanaiTotal += (lanai.summerKitchenCustomPrice ?? LANAI_PRICES.summerKitchen)
  if (lanai.telaPrivacidade) lanaiTotal += (lanai.telaPrivacidadeCustomPrice ?? LANAI_PRICES.telaPrivacidade)

  let decorationTotal = 0
  rooms.forEach(room => {
    const val = room.customPrice ?? calculateRoomValue(room.type, room.tier)
    const decRate = (globalSettings.decorationPercent[room.type] || 0) / 100
    decorationTotal += (val * room.quantity * decRate)
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

  const handleExport = (type: 'client' | 'internal' | 'contract') => {
    setExporting(type)
    setPrintMode(type)
    
    setTimeout(() => {
      window.print()
      setExporting(null)
      setPrintMode(null)
      if (type !== 'contract') {
        setSuccess(type)
        setTimeout(() => setSuccess(null), 4000)
      }
    }, 500)
  }

  const handleContractSave = async (clientData: any) => {
    setExporting('contract')
    
    if (selectedProjectId) {
      await updateProject(selectedProjectId, {
        clientName: clientData.clientName,
        clientEmail: clientData.clientEmail,
        passportNumber: clientData.passportNumber,
        clientAddress: clientData.clientAddress,
        vacationHomeAddress: clientData.vacationHomeAddress,
        status: 'approved',
        installmentDates: clientData.installments
      })
    }

    setCurrentContractData(clientData)
    setIsContractModalOpen(false)
    handleExport('contract')
  }

  return (
    <Card className="w-full border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-2xl overflow-hidden mt-6">
      <div className="p-6 sm:p-8">
         <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
           <DownloadCloud className="w-4 h-4 text-primary" /> Central de Relatórios & CRM
         </h3>
         <p className="text-xs text-slate-500 mb-6 font-medium">Capture os detalhes do cliente e formalize a venda gerando o contrato jurídico oficial da Noha.</p>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={() => handleExport('client')}
              disabled={exporting !== null}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${success === 'client' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-primary/50'} text-center group disabled:opacity-70`}
            >
              {exporting === 'client' ? (
                 <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mb-3" />
              ) : success === 'client' ? (
                 <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-3" />
              ) : (
                 <FileText className="w-8 h-8 text-slate-300 group-hover:text-primary mb-3 transition-colors" />
              )}
              <span className="font-semibold text-sm">Proposta Comercial</span>
              <span className="text-[10px] mt-1 text-slate-400">Visão Cliente</span>
            </button>

            <button 
              onClick={() => handleExport('internal')}
              disabled={exporting !== null}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${success === 'internal' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-400'} text-center group disabled:opacity-70`}
            >
              {exporting === 'internal' ? (
                 <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mb-3" />
              ) : success === 'internal' ? (
                 <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-3" />
              ) : (
                 <Briefcase className="w-8 h-8 text-slate-300 group-hover:text-slate-600 mb-3 transition-colors" />
              )}
              <span className="font-semibold text-sm">Dossiê Interno</span>
              <span className="text-[10px] mt-1 text-slate-400">Visão Gestão</span>
            </button>

            <button 
              onClick={() => setIsContractModalOpen(true)}
              disabled={exporting !== null}
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all text-center group disabled:opacity-70 ring-offset-2 focus:ring-2 ring-primary/20"
            >
              {exporting === 'contract' ? (
                 <RefreshCw className="w-8 h-8 text-primary animate-spin mb-3" />
              ) : (
                 <PenTool className="w-8 h-8 text-primary mb-3" />
              )}
              <span className="font-bold text-sm text-primary">Gerar Contrato Jurídico</span>
              <span className="text-[10px] mt-1 text-primary/60">CRM - Fechamento de Venda</span>
            </button>
         </div>
      </div>

      <ContractFormModal 
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        sellPrice={sellPrice}
        onSave={handleContractSave}
      />
    </Card>
  )
}
