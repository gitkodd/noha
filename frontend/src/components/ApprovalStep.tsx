import { useState } from 'react'
import { Card, CardContent } from './ui/Card'
import { useBudgetStore, LANAI_PRICES, type TierType } from '../store/useBudgetStore'
import { formatCurrency } from '../lib/utils'
import { CheckCircle2, Home, Trees, Briefcase, FileText, DownloadCloud, RefreshCw } from 'lucide-react'
import { ComboManager } from './ComboManager'

export function ApprovalStep() {
  const { rooms, lanai, commissions, globalSettings } = useBudgetStore()
  const rates = globalSettings.commissionRates || { markup: 40, ingrid: 10, corretor: 10, tati: 2, indicacao: 5 }

  const getTierFactor = (tier: TierType) => {
    if (tier === 'basic') return globalSettings.tierBasic / 100
    if (tier === 'premium') return globalSettings.tierPremium / 100
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
                  const base = globalSettings.roomBasePrices[room.type]
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

          {/* Lanai */}
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

          {/* Margens */}
          <div className="p-6 sm:p-8 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <Briefcase className="w-4 h-4 text-primary" /> Políticas de Margem Ativas
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className={`p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center transition-colors ${commissions.markup.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent opacity-50'}`}>
                <p className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-widest">Markup</p>
                <p className="text-xl font-medium text-slate-800">{commissions.markup.enabled ? `${rates.markup}%` : 'Off'}</p>
              </div>
              <div className={`p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center transition-colors ${commissions.ingrid.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent opacity-50'}`}>
                <p className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-widest">Projeto</p>
                <p className="text-xl font-medium text-slate-800">{commissions.ingrid.enabled ? `${rates.ingrid}%` : 'Off'}</p>
              </div>
              <div className={`p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center transition-colors ${commissions.corretor.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent opacity-50'}`}>
                <p className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-widest">Corretor</p>
                <p className="text-xl font-medium text-slate-800">{commissions.corretor.enabled ? `${rates.corretor}%` : 'Off'}</p>
              </div>
              <div className={`p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center transition-colors ${commissions.tati.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent opacity-50'}`}>
                <p className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-widest">Fee Ope.</p>
                <p className="text-xl font-medium text-slate-800">{commissions.tati.enabled ? `${rates.tati}%` : 'Off'}</p>
              </div>
              <div className={`p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center transition-colors ${commissions.indicacao.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent opacity-50'}`}>
                <p className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-widest">Indicação</p>
                <p className="text-xl font-medium text-slate-800">{commissions.indicacao.enabled ? `${rates.indicacao}%` : 'Off'}</p>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Export PDFs Mock */}
      <ExportPDFsMock />

      {/* Persistence Area (Combos) */}
      <ComboManager />
    </div>
  )
}

function ExportPDFsMock() {
  const [exporting, setExporting] = useState<'client' | 'internal' | null>(null)
  const [success, setSuccess] = useState<'client' | 'internal' | null>(null)
  const { setPrintMode } = useBudgetStore()

  const handleExport = (type: 'client' | 'internal') => {
    setExporting(type)
    setPrintMode(type)
    
    // Deixa renderizar a view hidden do CSS
    setTimeout(() => {
      window.print()
      
      setExporting(null)
      setPrintMode(null)
      setSuccess(type)
      setTimeout(() => setSuccess(null), 4000)
    }, 500)
  }

  return (
    <Card className="w-full border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-2xl overflow-hidden mt-6">
      <div className="p-6 sm:p-8">
         <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
           <DownloadCloud className="w-4 h-4 text-primary" /> Central de Relatórios Inteligente
         </h3>
         <p className="text-xs text-slate-500 mb-6 font-medium">O motor de exportação NOHA gerará PDFs limpos garantindo que os takes-outs corporativos sejam omitidos na via do cliente.</p>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <span className={`font-semibold text-sm ${success === 'client' ? 'text-emerald-700' : 'text-slate-700'}`}>
                {success === 'client' ? 'Proposta Gerada' : 'Gerar Proposta Comercial'}
              </span>
              <span className={`text-[10px] mt-1 ${success === 'client' ? 'text-emerald-600/70' : 'text-slate-400'}`}>Visão do Cliente (Sem Margens Abertas)</span>
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
              <span className={`font-semibold text-sm ${success === 'internal' ? 'text-emerald-700' : 'text-slate-700'}`}>
                {success === 'internal' ? 'Dossiê Gerado' : 'Baixar Dossiê Interno'}
              </span>
              <span className={`text-[10px] mt-1 ${success === 'internal' ? 'text-emerald-600/70' : 'text-slate-400'}`}>Todas as margens detalhadas p/ Gestão</span>
            </button>
         </div>
      </div>
    </Card>
  )
}
