import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { Switch } from './ui/Switch'
import { useBudgetStore, type RoomType, type TierType, ROOM_HISTORY, LANAI_PRICES, DEFAULT_ROOM_BASE_PRICES, LANAI_HISTORY } from '../store/useBudgetStore'
import { formatCurrency } from '../lib/utils'
import { Plus, Trash2, Home, Activity, ShieldCheck, Zap, Trees, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react'
import { RiskRadar } from './intelligence/RiskRadar'

const roomTypes: RoomType[] = ['Quarto Temático', 'Quarto Normal', 'Loft', 'Garagem', 'Cinema', 'Delphino']

export function RoomConfigurator() {
  const { rooms, addRoom, updateRoom, removeRoom, showHistory, toggleHistory, globalSettings, lanai, toggleLanai, updateLanaiPrice } = useBudgetStore()
  const [activeRooms, setActiveRooms] = useState<string[]>([])

  const toggleAccordion = (id: string) => {
    // Single-expansion mode by default as requested: "sempre fica somente 1 aberto por padrão"
    setActiveRooms(prev => prev.includes(id) ? [] : [id])
  }

  const handleAddRoom = (type: RoomType) => {
    const newRoomId = crypto.randomUUID()
    addRoom(type, newRoomId)
    setActiveRooms([newRoomId]) // Fecha outros e abre o novo
  }

  const calculateRoomValue = (type: RoomType, tier: TierType) => {
    const base = globalSettings.roomBasePrices[type] || DEFAULT_ROOM_BASE_PRICES[type] || 0
    let factor = 0
    if (tier === 'basic') factor = -Math.abs(globalSettings.tierBasic) / 100
    if (tier === 'premium') factor = Math.abs(globalSettings.tierPremium) / 100
    
    return base * (1 + factor)
  }

  return (
    <Card className="w-full border-none shadow-xl bg-white rounded-2xl">
      <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-slate-100 gap-4">
        <div className="space-y-1.5">
          <CardTitle className="text-xl font-medium tracking-tight flex items-center gap-2 text-slate-800">
            <Home className="w-5 h-5 text-primary" />
            Configuração de Ambientes
          </CardTitle>
          <p className="text-sm text-slate-500 font-light">Defina as áreas escopadas e seus níveis de acabamento estrutural.</p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-full border border-slate-100 shadow-sm w-fit">
          <Activity className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Benchmarking Histórico</span>
          <Switch checked={showHistory} onCheckedChange={toggleHistory} />
        </div>
      </CardHeader>
      
      <CardContent className="pt-8 space-y-8">
        {/* ─── MÓDULO ESPECIAL: LANAI & AMENITIES (Accordion) ─── */}
        <div className={`rounded-[1.5rem] transition-all duration-300 border ${activeRooms.includes('lanai') ? 'p-5 sm:p-6 bg-slate-50/50 border-primary/30 shadow-inner' : 'p-4 bg-white border-slate-100 shadow-sm hover:border-primary/20'}`}>
          <div 
            onClick={() => toggleAccordion('lanai')}
            className="flex items-center justify-between cursor-pointer group/lanai"
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${activeRooms.includes('lanai') ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 group-hover/lanai:bg-primary/10 group-hover/lanai:text-primary'}`}>
                <Trees className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900">Amenities Lanai</h3>
                {!activeRooms.includes('lanai') && (
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Área Externa & Lazer</p>
                )}
              </div>
            </div>
            <button className="p-1 rounded-md hover:bg-slate-100 text-slate-400">
              {activeRooms.includes('lanai') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>

          {activeRooms.includes('lanai') && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {([
                { id: 'telao' as const, label: 'Telão Integrado', price: LANAI_PRICES.telao, custom: lanai.telaoCustomPrice, customId: 'telaoCustomPrice' as const },
                { id: 'summerKitchen' as const, label: 'Summer Kitchen', price: LANAI_PRICES.summerKitchen, custom: lanai.summerKitchenCustomPrice, customId: 'summerKitchenCustomPrice' as const },
                { id: 'telaPrivacidade' as const, label: 'Tela Privacidade', price: LANAI_PRICES.telaPrivacidade, custom: lanai.telaPrivacidadeCustomPrice, customId: 'telaPrivacidadeCustomPrice' as const },
              ] as const).map((opt) => (
                <div key={opt.id} className={`flex flex-col p-4 rounded-xl border transition-all group ${lanai[opt.id] ? 'bg-white border-primary shadow-md ring-1 ring-primary/20' : 'bg-white border-slate-100 opacity-60 shadow-sm'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${lanai[opt.id] ? 'text-primary' : 'text-slate-400'}`}>
                      {lanai[opt.id] ? 'Ativado' : 'Inativo'}
                    </span>
                    <Switch
                      checked={lanai[opt.id]}
                      onCheckedChange={() => toggleLanai(opt.id)}
                      className="scale-75"
                    />
                  </div>
                  
                  <span className="font-bold text-slate-800 text-xs mb-1 truncate">{opt.label}</span>
                  
                  <div className="mt-2 space-y-1.5">
                    <div className="relative flex items-center group/price">
                      <span className="absolute left-2.5 text-[10px] font-bold text-slate-400">$</span>
                      <input 
                        type="number"
                        disabled={!lanai[opt.id]}
                        value={opt.custom !== null && opt.custom !== undefined ? opt.custom : opt.price}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : Number(e.target.value)
                          updateLanaiPrice(opt.customId, val)
                        }}
                        className={`w-full h-8 pl-6 pr-2 text-right font-black text-sm rounded-lg border focus:outline-none transition-all ${!lanai[opt.id] ? 'bg-slate-50 border-transparent' : (opt.custom !== null ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-slate-100 hover:border-slate-200 text-slate-900')}`}
                      />
                    </div>
                  </div>

                  {/* Lanai Intelligence */}
                  {showHistory && lanai[opt.id] && (
                    <div className="mt-3 pt-3 border-t border-dashed border-slate-100 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Bench: {formatCurrency(LANAI_HISTORY[opt.id])}</span>
                        {(opt.custom ?? opt.price) >= LANAI_HISTORY[opt.id] ? (
                          <span className="text-[8px] font-black text-emerald-500 uppercase flex items-center gap-0.5">
                            <ShieldCheck className="w-2 h-2" /> Margem OK
                          </span>
                        ) : (
                          <span className="text-[8px] font-black text-amber-500 uppercase flex items-center gap-0.5">
                            <Zap className="w-2 h-2 animate-pulse" /> Risco de Margem
                          </span>
                        )}
                      </div>
                      
                      {opt.custom !== null && opt.custom !== undefined && (
                        <button 
                          onClick={() => updateLanaiPrice(opt.customId, null)}
                          className="flex items-center gap-1 text-[8px] text-primary font-bold uppercase tracking-wider hover:underline"
                        >
                          <RotateCcw className="w-2 h-2" /> Restaurar Padrão
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

        {rooms.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="mb-4 font-light">Os ambientes internos estão vazios. Adicione um módulo abaixo para detalhar o interior.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => {
              const suggestionValue = calculateRoomValue(room.type, room.tier)
              const currentValue = room.customPrice !== undefined && room.customPrice !== null ? room.customPrice : suggestionValue
              const rawHistoryValue = ROOM_HISTORY[room.type]
              const isOpen = activeRooms.includes(room.id)
              
              let historyValue = rawHistoryValue
              if (rawHistoryValue) {
                if (room.tier === 'basic') {
                  historyValue = rawHistoryValue * (1 - Math.abs(globalSettings.tierBasic) / 100)
                } else if (room.tier === 'premium') {
                  historyValue = rawHistoryValue * (1 + Math.abs(globalSettings.tierPremium) / 100)
                }
              }
              
              return (
                <div key={room.id} className={`group flex flex-col rounded-[1.5rem] bg-white transition-all duration-300 border ${isOpen ? 'border-primary/30 shadow-xl p-5 sm:p-6 mb-4' : 'border-slate-100 shadow-sm p-4 mb-2 hover:border-primary/20'}`}>
                  
                  {/* Título do cômodo / Accordion Header */}
                  <div 
                    onClick={() => toggleAccordion(room.id)}
                    className="flex items-center justify-between w-full cursor-pointer group/header"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 group-hover/header:bg-primary/10 group-hover/header:text-primary'}`}>
                        <Home className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900">{room.type}</h3>
                        {!isOpen && (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{room.tier} · {room.quantity}x</span>
                            <span className="text-[9px] font-bold text-primary">{formatCurrency(currentValue * room.quantity)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {!isOpen && (
                        <div className="hidden sm:flex items-center gap-2 mr-4">
                          <div className="h-1 w-20 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: room.tier === 'basic' ? '33%' : room.tier === 'premium' ? '100%' : '66%' }}></div>
                          </div>
                        </div>
                      )}
                      <button className="p-1 rounded-md hover:bg-slate-100 text-slate-400">
                        {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Accordion Content */}
                  {isOpen && (
                    <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      {/* Botões e Preço na Linha 2 de ponta a ponta */}
                      <div className="flex flex-wrap md:flex-nowrap items-center gap-4 xl:gap-6 w-full justify-between">
                        
                        {/* Minimalist Tier Selector */}
                        <div className="flex items-center gap-2 xl:gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              updateRoom(room.id, { tier: 'basic', customPrice: null }); 
                            }}
                            className={`w-[75px] sm:w-[85px] xl:w-[95px] flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-300 border ${room.tier === 'basic' ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-transparent border-slate-200 text-slate-400 hover:border-primary/50 hover:text-primary'} `}
                          >
                            <span className={`text-[11px] tracking-wide uppercase ${room.tier === 'basic' ? 'font-bold' : 'font-medium'}`}>Basic</span>
                            <span className={`text-[9.5px] leading-none mt-1 ${room.tier === 'basic' ? 'opacity-90 font-bold' : 'opacity-60'}`}>{-Math.abs(globalSettings.tierBasic)}%</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateRoom(room.id, { tier: 'intermediario', customPrice: null });
                            }}
                            className={`w-[75px] sm:w-[85px] xl:w-[95px] flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-300 border ${room.tier === 'intermediario' ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-transparent border-slate-200 text-slate-400 hover:border-primary/50 hover:text-primary'} `}
                          >
                            <span className={`text-[11px] tracking-wide uppercase ${room.tier === 'intermediario' ? 'font-bold' : 'font-medium'}`}>Padrão</span>
                            <span className="text-[9.5px] leading-none mt-1 opacity-0 select-none">-</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateRoom(room.id, { tier: 'premium', customPrice: null });
                            }}
                            className={`w-[75px] sm:w-[85px] xl:w-[95px] flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-300 border ${room.tier === 'premium' ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-transparent border-slate-200 text-slate-400 hover:border-primary/50 hover:text-primary'} `}
                          >
                            <span className={`text-[11px] tracking-wide uppercase ${room.tier === 'premium' ? 'font-bold' : 'font-medium'}`}>Premium</span>
                            <span className={`text-[9.5px] leading-none mt-1 ${room.tier === 'premium' ? 'opacity-90 font-bold' : 'opacity-60'}`}>(+{Math.abs(globalSettings.tierPremium)}%)</span>
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4 xl:gap-8 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                          {/* Premium Quantity Stepper */}
                          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden h-10 w-[100px] shrink-0">
                            <button 
                              type="button"
                              onClick={() => updateRoom(room.id, { quantity: Math.max(1, room.quantity - 1) })}
                              className="h-full px-3 text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors text-lg leading-none"
                            >
                              -
                            </button>
                            <span className="flex-1 flex items-center justify-center text-sm font-bold text-slate-900 h-full bg-white">{room.quantity}</span>
                            <button 
                              type="button"
                              onClick={() => updateRoom(room.id, { quantity: room.quantity + 1 })}
                              className="h-full px-3 text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors text-lg leading-none"
                            >
                              +
                            </button>
                          </div>

                          {/* Premium Price (Sugerido da média do banco, porém CUSTOMIZÁVEL) */}
                          <div className="flex flex-col items-end w-auto sm:w-36 shrink-0 relative group/price">
                            <div className="relative flex items-center">
                              <span className="absolute left-3 text-slate-400 font-bold">$</span>
                              <input 
                                type="number"
                                value={currentValue * room.quantity}
                                onChange={(e) => {
                                  const totalVal = e.target.value === '' ? null : Number(e.target.value);
                                  const unitVal = totalVal !== null ? totalVal / room.quantity : null;
                                  updateRoom(room.id, { customPrice: unitVal });
                                }}
                                className={`w-full h-10 pl-7 pr-3 text-right font-black text-[1.25rem] tracking-tighter rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${room.customPrice ? 'bg-primary/8 border-primary/40 text-foreground' : 'bg-transparent border-transparent hover:border-slate-200 text-slate-900'}`}
                              />
                            </div>
                            {room.customPrice && (
                              <button 
                                onClick={() => updateRoom(room.id, { customPrice: null })}
                                className="text-[9px] text-primary font-bold uppercase tracking-wider hover:text-foreground mt-1 cursor-pointer"
                              >
                                Restaurar {formatCurrency(suggestionValue)}
                              </button>
                            )}
                            {!room.customPrice && (
                              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1 opacity-0 group-hover/price:opacity-100 transition-opacity">
                                Editar valor unit.
                              </div>
                            )}
                          </div>

                          <Button variant="ghost" size="icon" onClick={() => removeRoom(room.id)} className="h-10 w-10 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all shrink-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Zona de Inteligência — separada visualmente da zona de configuração */}
                      {showHistory && historyValue && (
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pt-4 mt-1 border-t border-dashed border-border/50">
                          
                          {/* Left: Benchmark text + Action Buttons */}
                          <div className="flex flex-col gap-3">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                              BENCHMARK ({room.tier === 'intermediario' ? 'PADRÃO' : room.tier.toUpperCase()}): <strong className="text-slate-800">{formatCurrency(historyValue)}</strong>
                            </span>
                            
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateRoom(room.id, { customPrice: historyValue })}
                                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-foreground rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors border border-primary/25 shadow-sm"
                              >
                                APLICAR MÉDIA
                              </button>

                              {currentValue >= historyValue ? (
                                <span className="font-bold px-3 py-1.5 bg-accent-intel/10 text-accent-intel rounded-lg border border-accent-intel/25 shadow-sm flex items-center gap-1.5 text-[10px] uppercase tracking-widest leading-none">
                                  <ShieldCheck className="w-3 h-3 text-accent-intel" />
                                  Margem Segura
                                </span>
                              ) : (
                                <span className="font-bold px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200/50 shadow-sm flex items-center gap-1.5 text-[10px] uppercase tracking-widest leading-none">
                                  <Zap className="w-3 h-3 text-amber-500 animate-pulse" />
                                  Risco de Margem
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Right: Intelligence Box */}
                          <div className="flex items-center text-[10px] sm:text-[11px] text-accent-intel bg-accent-intel/8 p-3 sm:px-4 sm:py-3 rounded-xl border border-accent-intel/20 shadow-sm w-full md:w-auto md:max-w-xs shrink-0">
                            <Activity className="w-4 h-4 mr-3 text-accent-intel shrink-0" />
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-accent-intel uppercase tracking-wider text-[9px]">INTELIGÊNCIA NOHA</span> 
                              <span className="opacity-80 font-medium leading-tight text-foreground/70">Benchmarking baseado em performance real de 4 projetos (Jaqueline, MaFe, Susana e Packer).</span>
                            </div>
                          </div>

                        </div>
                      )}

                      {/* Feature C: Radar de Desvio */}
                      {showHistory && (
                        <RiskRadar
                          roomType={room.type}
                          baseValue={historyValue ?? suggestionValue}
                          currentValue={currentValue}
                          onApplyBuffer={(newValue) => updateRoom(room.id, { customPrice: newValue })}
                        />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
          <p className="text-xs uppercase tracking-widest text-slate-400 w-full mb-1">Adicionar Módulo Base</p>
          {roomTypes.map(type => (
            <Button 
              key={type} 
              variant="outline" 
              size="sm" 
              onClick={() => handleAddRoom(type)} 
              className="rounded-full shadow-sm text-slate-600 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all text-[10px]"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> {type}
            </Button>
          ))}
        </div>


      </CardContent>
    </Card>
  )
}
