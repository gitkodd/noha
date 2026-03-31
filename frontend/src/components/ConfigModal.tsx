import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Settings, X, Tag, Calculator, Database, UploadCloud, FileSpreadsheet, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Button } from './ui/Button'
import { useBudgetStore, type GlobalSettings, type RoomType, type CommissionRates } from '../store/useBudgetStore'

export function ConfigModal() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'precificacao' | 'margens' | 'inteligencia'>('precificacao')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const { globalSettings, updateGlobalSettings } = useBudgetStore()
  
  const [form, setForm] = useState<GlobalSettings>(globalSettings)

  useEffect(() => {
    const normalizeSettings = (s: any): GlobalSettings => {
      let migrated = { ...s }
      
      if (typeof s.decorationPercent === 'number') {
        const standardRate = s.decorationPercent;
        migrated.decorationPercent = {
          'Quarto Temático': standardRate,
          'Quarto Normal': standardRate,
          'Loft': standardRate,
          'Garagem': standardRate,
          'Cinema': standardRate,
          'Delphino': standardRate,
        }
      }

      if (!s.commissionRates) {
        migrated.commissionRates = {
          markup: 40,
          ingrid: 10,
          corretor: 10,
          tati: 2,
          indicacao: 5,
        }
      }

      return migrated as GlobalSettings;
    };
    
    setForm(normalizeSettings(globalSettings))
  }, [globalSettings, open])

  const handleOpen = () => setOpen(true)

  const handleSave = () => {
    updateGlobalSettings(form)
    setOpen(false)
  }

  const handleSimulateUpload = () => {
    setIsUploading(true)
    setUploadSuccess(false)
    setTimeout(() => {
      setIsUploading(false)
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 8000)
    }, 2500)
  }

  const handleRoomPriceChange = (room: RoomType, value: string) => {
    const num = parseFloat(value) || 0
    setForm(prev => ({ ...prev, roomBasePrices: { ...prev.roomBasePrices, [room]: num } }))
  }

  const handleDecorationChange = (room: RoomType, value: string) => {
    const num = parseFloat(value) || 0
    setForm(prev => ({ ...prev, decorationPercent: { ...prev.decorationPercent, [room]: num } }))
  }

  const handleCommissionChange = (key: keyof CommissionRates, value: string) => {
    const num = parseFloat(value) || 0
    setForm(prev => ({ ...prev, commissionRates: { ...prev.commissionRates, [key]: num } }))
  }

  return (
    <>
      <Button 
        variant="outline"
        onClick={handleOpen}
        className="rounded-full px-5 h-10 border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/50 shadow-sm transition-all font-semibold flex items-center justify-center gap-2 bg-white"
        title="Configurações do Sistema"
      >
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Configurações Base</span>
      </Button>

      {open && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-left">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Painel Admin - NOHA Base</h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700 bg-white rounded-full p-2 hover:bg-slate-100 transition-all border border-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB Navigation */}
            <div className="flex items-center px-6 pt-2 bg-slate-50/50 border-b border-slate-100 overflow-x-auto hide-scrollbar gap-6">
              <button 
                onClick={() => setActiveTab('precificacao')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-semibold text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'precificacao' ? 'border-primary text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Tag className="w-4 h-4" />
                Precificação & Módulos
              </button>
              <button 
                onClick={() => setActiveTab('margens')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-semibold text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'margens' ? 'border-primary text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Calculator className="w-4 h-4" />
                Políticas Comerciais
              </button>
              <button 
                onClick={() => setActiveTab('inteligencia')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-semibold text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'inteligencia' ? 'border-primary text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Database className="w-4 h-4" />
                Inteligência de Custos
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-10 flex-1 bg-white">
              
              {/* TAB 1: Precificação e Módulos */}
              {activeTab === 'precificacao' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <section className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Variação de Acabamento (%) - Tiers</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Coeficiente Basic (%)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={form.tierBasic} 
                            onChange={(e) => setForm({...form, tierBasic: parseFloat(e.target.value) || 0})}
                            className="w-full rounded-xl border-0 py-2.5 pl-4 pr-8 text-slate-900 bg-slate-50 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm font-medium"
                          />
                          <span className="absolute right-3 top-2.5 text-slate-400 font-medium pointer-events-none">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Coeficiente Premium (%)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={form.tierPremium} 
                            onChange={(e) => setForm({...form, tierPremium: parseFloat(e.target.value) || 0})}
                            className="w-full rounded-xl border-0 py-2.5 pl-4 pr-8 text-slate-900 bg-slate-50 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm font-medium"
                          />
                          <span className="absolute right-3 top-2.5 text-slate-400 font-medium pointer-events-none">%</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Configurar Tabelas de Módulos (Base $ e Decoração %)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(Object.keys(form.roomBasePrices) as RoomType[]).map((room) => (
                        <div key={room} className="flex flex-col p-5 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow space-y-4">
                          <label className="text-sm font-bold text-slate-800 tracking-tight">{room}</label>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-500">Módulo Base</span>
                              <div className="relative w-28">
                                <span className="absolute left-3 top-2 text-slate-400 font-medium pointer-events-none">$</span>
                                <input 
                                  type="number" 
                                  value={form.roomBasePrices[room]} 
                                  onChange={(e) => handleRoomPriceChange(room, e.target.value)}
                                  className="w-full rounded-lg border-0 py-2 pl-6 pr-3 text-slate-900 bg-slate-50 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm font-medium text-right"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-500">Tx. Decoração</span>
                              <div className="relative w-28">
                                <input 
                                  type="number" 
                                  value={form.decorationPercent?.[room] !== undefined ? form.decorationPercent[room] : 5} 
                                  onChange={(e) => handleDecorationChange(room, e.target.value)}
                                  className="w-full rounded-lg border-0 py-2 pl-3 pr-8 text-slate-900 bg-slate-50 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm font-medium text-right"
                                />
                                <span className="absolute right-3 top-2 text-slate-400 font-medium pointer-events-none">%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* TAB 2: Políticas Comerciais */}
              {activeTab === 'margens' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <section className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Variáveis Globais de Comissionamento e Margem</h3>
                    <p className="text-slate-500 text-sm mb-6">Estes valores refletem as travas numéricas impostas a todos os orçamentos. Pelo formulário de negociação, o gerente de contas poderá apenas ligar ou desligar o repasse dessas verbas, não podendo editar sua porcentagem.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      
                      <div className="flex flex-col p-4 border border-slate-100 rounded-2xl bg-slate-50 space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-slate-800"></div>
                        <label className="text-sm font-semibold text-slate-800 tracking-tight">Markup Corporativo</label>
                        <p className="text-[10px] text-slate-500">Margem primária adicionada sobre o CMV.</p>
                        <div className="relative mt-2">
                          <input type="number" value={form.commissionRates?.markup || 0} onChange={(e) => handleCommissionChange('markup', e.target.value)} className="w-full rounded-xl border-0 py-2 pl-4 pr-8 text-slate-900 bg-white ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-lg font-medium shadow-sm" />
                          <span className="absolute right-4 top-2.5 text-slate-400 font-medium pointer-events-none">%</span>
                        </div>
                      </div>

                      <div className="flex flex-col p-4 border border-slate-100 rounded-2xl bg-slate-50 space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                        <label className="text-sm font-semibold text-slate-800 tracking-tight">Fee de Projeto</label>
                        <p className="text-[10px] text-slate-500">Repasse da modelagem de interiores.</p>
                        <div className="relative mt-2">
                          <input type="number" value={form.commissionRates?.ingrid || 0} onChange={(e) => handleCommissionChange('ingrid', e.target.value)} className="w-full rounded-xl border-0 py-2 pl-4 pr-8 text-slate-900 bg-white ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-lg font-medium shadow-sm" />
                          <span className="absolute right-4 top-2.5 text-slate-400 font-medium pointer-events-none">%</span>
                        </div>
                      </div>

                      <div className="flex flex-col p-4 border border-slate-100 rounded-2xl bg-slate-50 space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                        <label className="text-sm font-semibold text-slate-800 tracking-tight">Corretagem Base</label>
                        <p className="text-[10px] text-slate-500">Dedução em cima do Sell Price Final.</p>
                        <div className="relative mt-2">
                          <input type="number" value={form.commissionRates?.corretor || 0} onChange={(e) => handleCommissionChange('corretor', e.target.value)} className="w-full rounded-xl border-0 py-2 pl-4 pr-8 text-slate-900 bg-white ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-lg font-medium shadow-sm" />
                          <span className="absolute right-4 top-2.5 text-slate-400 font-medium pointer-events-none">%</span>
                        </div>
                      </div>

                      <div className="flex flex-col p-4 border border-slate-100 rounded-2xl bg-slate-50 space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-accent-intel"></div>
                        <label className="text-sm font-semibold text-slate-800 tracking-tight">Fee Operacional</label>
                        <p className="text-[10px] text-slate-500">Dedução em cima do Sell Price Final.</p>
                        <div className="relative mt-2">
                          <input type="number" value={form.commissionRates?.tati || 0} onChange={(e) => handleCommissionChange('tati', e.target.value)} className="w-full rounded-xl border-0 py-2 pl-4 pr-8 text-slate-900 bg-white ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-lg font-medium shadow-sm" />
                          <span className="absolute right-4 top-2.5 text-slate-400 font-medium pointer-events-none">%</span>
                        </div>
                      </div>

                      <div className="flex flex-col p-4 border border-slate-100 rounded-2xl bg-slate-50 space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <label className="text-sm font-semibold text-slate-800 tracking-tight">Indicação Projeto</label>
                        <p className="text-[10px] text-slate-500">Verba para lead gerado por intermédio.</p>
                        <div className="relative mt-2">
                          <input type="number" value={form.commissionRates?.indicacao || 0} onChange={(e) => handleCommissionChange('indicacao', e.target.value)} className="w-full rounded-xl border-0 py-2 pl-4 pr-8 text-slate-900 bg-white ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-lg font-medium shadow-sm" />
                          <span className="absolute right-4 top-2.5 text-slate-400 font-medium pointer-events-none">%</span>
                        </div>
                      </div>

                    </div>
                  </section>
                </div>
              )}

              {/* TAB 3: Inteligência de Custos (Mock Demo) */}
              {activeTab === 'inteligencia' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl mx-auto pt-6">
                  <div className="text-center space-y-2 mb-8">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">Alimentação do Algoritmo de Custos</h3>
                    <p className="text-slate-500 text-sm">Faça o upload do seu extrato M3 de custos de obras (Data Warehouse). O sistema usará Machine Learning para refatorar os $ preços dinamicamente de acordo com a média histórica recente.</p>
                  </div>

                  <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors group cursor-not-allowed">
                    <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                       <FileSpreadsheet className="w-8 h-8 text-primary/60" />
                    </div>
                    <h4 className="text-slate-800 font-semibold mb-1">Arraste sua planilha .CSV aqui</h4>
                    <p className="text-slate-400 text-xs text-center max-w-xs">Suporta arquivos até 50mb contendo colunas catalogadas de cômodos e seus respectivos custos brutos.</p>
                    <Button variant="outline" className="mt-6 bg-white rounded-xl shadow-sm text-primary font-medium border-primary/20 pointer-events-none">
                       <UploadCloud className="w-4 h-4 mr-2" />
                       Selecionar Arquivo
                    </Button>
                  </div>

                  <div className="flex flex-col items-center mt-12 pb-10">
                    {!uploadSuccess ? (
                       <Button 
                         onClick={handleSimulateUpload}
                         disabled={isUploading}
                         className="w-full sm:w-auto px-8 py-6 rounded-2xl bg-slate-900 hover:bg-black text-white font-semibold text-base sm:text-lg shadow-xl shadow-slate-900/20 disabled:opacity-75 transition-all"
                       >
                         {isUploading ? (
                           <>
                             <RefreshCw className="w-5 h-5 mr-3 animate-spin text-slate-400" />
                             Processando Dados M3...
                           </>
                         ) : (
                           <>
                             <Database className="w-5 h-5 mr-3 text-primary/80" />
                             Analisar Custos e Refatorar Médias
                           </>
                         )}
                       </Button>
                    ) : (
                       <div className="w-full bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                         <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
                         <h4 className="font-bold text-lg mb-1">Sincronização Concluída com Sucesso!</h4>
                         <p className="text-emerald-600/80 text-sm">A inteligência artificial processou 1.250 linhas do extrato importado. Os valores da aba "Precificação Base" foram reajustados de acordo com sua média trimestral de custo real com 98% de acurácia.</p>
                       </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3 rounded-b-3xl">
              <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl px-5 text-slate-600 hover:text-slate-900 border border-slate-200 bg-white">Cancelar</Button>
              <Button onClick={handleSave} className="rounded-xl px-10 bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 hover:bg-primary/90">Anotar Padrões no Cache</Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
