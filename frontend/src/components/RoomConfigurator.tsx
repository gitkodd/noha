import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { Switch } from './ui/Switch'
import { useBudgetStore, type RoomType, type TierType, ROOM_HISTORY } from '../store/useBudgetStore'
import { formatCurrency } from '../lib/utils'
import { Plus, Trash2, Home, Activity, ShieldCheck, Zap } from 'lucide-react'
import { RiskRadar } from './intelligence/RiskRadar'

const roomTypes: RoomType[] = ['Quarto Temático', 'Quarto Adulto', 'Loft', 'Garagem', 'Cinema', 'Delphino']

export function RoomConfigurator() {
  const { rooms, addRoom, updateRoom, removeRoom, showHistory, toggleHistory, globalSettings } = useBudgetStore()

  const calculateRoomValue = (type: RoomType, tier: TierType) => {
    const base = globalSettings.roomBasePrices[type]
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
      
      <CardContent className="pt-8 space-y-6">
        {rooms.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="mb-4 font-light">O escopo está vazio. Selecione um módulo base abaixo para iniciar o estudo.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => {
              const suggestionValue = calculateRoomValue(room.type, room.tier)
              const currentValue = room.customPrice !== undefined && room.customPrice !== null ? room.customPrice : suggestionValue
              const rawHistoryValue = ROOM_HISTORY[room.type]
              
              let historyValue = rawHistoryValue
              if (rawHistoryValue) {
                if (room.tier === 'basic') {
                  historyValue = rawHistoryValue * (1 - Math.abs(globalSettings.tierBasic) / 100)
                } else if (room.tier === 'premium') {
                  historyValue = rawHistoryValue * (1 + Math.abs(globalSettings.tierPremium) / 100)
                }
              }
              
              return (
                <div key={room.id} className="group flex flex-col p-5 sm:p-6 rounded-[1.5rem] bg-white hover:shadow-xl transition-all duration-300 gap-4 border border-slate-100 shadow-sm overflow-hidden">
                  
                  {/* Título Isolado Linha 1 */}
                  <div className="flex items-center w-full border-b border-slate-100/60 pb-3">
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 truncate">{room.type}</h3>
                  </div>

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

                      <Button variant="ghost" size="icon" onClick={() => removeRoom(room.id)} className="h-10 w-10 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full lg:opacity-0 lg:group-hover:opacity-100 transition-all shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Colored Intelligence Footer */}
                  {showHistory && historyValue && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pt-5 mt-3 border-t border-slate-100/80">
                      
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
              )
            })}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
          <p className="text-xs uppercase tracking-widest text-slate-400 w-full mb-1">Adicionar Módulo Base</p>
          {roomTypes.map(type => (
            <Button key={type} variant="outline" size="sm" onClick={() => addRoom(type)} className="rounded-full shadow-sm text-slate-600 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> {type}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
