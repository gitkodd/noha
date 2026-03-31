import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { useBudgetStore, DEFAULT_ROOM_BASE_PRICES, type RoomItem, type LanaiOptions, type RoomType, type TierType } from '../store/useBudgetStore'
import { useProjectStore } from '../store/useProjectStore'
import { FolderOpen, Trash2, Library, User, Mail, Tag, Cloud, RefreshCw } from 'lucide-react'

interface Combo {
  id: string;
  name: string;
  clientName?: string;
  clientEmail?: string;
  rooms: RoomItem[];
  lanai: LanaiOptions;
}

const STORAGE_KEY = '@noha-budget/combos'

export function ComboManager() {
  const { rooms, lanai, loadState, clientName, clientEmail, setClientName, setClientEmail, globalSettings } = useBudgetStore()
  const { createProject } = useProjectStore()
  const [combos, setCombos] = useState<Combo[]>([])
  const [newComboName, setNewComboName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setCombos(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse combos')
      }
    }
  }, [])

  const saveCombos = (newCombos: Combo[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCombos))
    setCombos(newCombos)
  }

  const handleSaveCurrent = async () => {
    if (!newComboName.trim()) return
    setIsSaving(true)
    
    // Calcular Total Básico para o resumo do Projeto
    const calculateRoomValue = (type: RoomType, tier: TierType) => {
      const base = globalSettings.roomBasePrices[type] || DEFAULT_ROOM_BASE_PRICES[type] || 0
      let factor = 0
      if (tier === 'basic') factor = -Math.abs(globalSettings.tierBasic) / 100
      if (tier === 'premium') factor = Math.abs(globalSettings.tierPremium) / 100
      return base * (1 + factor)
    }

    let roomsPrice = 0
    rooms.forEach(r => {
      roomsPrice += (r.customPrice ?? calculateRoomValue(r.type, r.tier)) * r.quantity
    })

    const combo: Combo = {
      id: crypto.randomUUID(),
      name: newComboName.trim(),
      clientName,
      clientEmail,
      rooms: JSON.parse(JSON.stringify(rooms)),
      lanai: JSON.parse(JSON.stringify(lanai)),
    }

    // 1. Salvar no Supabase (Lead na Nuvem)
    try {
      await createProject({
        name: newComboName.trim(),
        clientName,
        clientEmail,
        status: 'draft',
        budgetData: { rooms: combo.rooms, lanai: combo.lanai },
        rooms: [], // Os quartos detalhados ficam no budgetData por enquanto
        totalPrice: roomsPrice,
        totalActual: 0,
        roomCount: rooms.reduce((s, r) => s + r.quantity, 0),
        thematicCount: rooms.filter(r => r.type === 'Quarto Temático').reduce((s, r) => s + r.quantity, 0),
        adultCount: rooms.filter(r => r.type === 'Quarto Normal').reduce((s, r) => s + r.quantity, 0),
        loftCount: rooms.filter(r => r.type === 'Loft').reduce((s, r) => s + r.quantity, 0),
        gameRoomCount: rooms.filter(r => r.type === 'Garagem' || r.type === 'Cinema').reduce((s, r) => s + r.quantity, 0),
        hasLanai: lanai.telao || lanai.summerKitchen || lanai.telaPrivacidade,
        coverage: 0,
        date: new Date().toISOString()
      } as any)
    } catch (err) {
      console.error('Erro ao salvar no Supabase:', err)
    }

    // 2. Salvar Localmente (Backup)
    saveCombos([...combos, combo])
    setNewComboName('')
    setIsSaving(false)
    alert('Lead e Orçamento salvos com sucesso na nuvem!')
  }

  const handleLoad = (combo: Combo) => {
    if (confirm(`Deseja carregar o projeto "${combo.name}"?`)) {
      loadState({
        rooms: JSON.parse(JSON.stringify(combo.rooms)),
        lanai: JSON.parse(JSON.stringify(combo.lanai)),
      })
      if (combo.clientName) setClientName(combo.clientName)
      if (combo.clientEmail) setClientEmail(combo.clientEmail)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Excluir este combo?')) {
      saveCombos(combos.filter(c => c.id !== id))
    }
  }

  return (
    <Card className="w-full border-none shadow-xl bg-white rounded-2xl overflow-hidden">
      <CardHeader className="pb-6 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-xl font-medium tracking-tight flex items-center gap-2 text-slate-800">
          <Library className="w-5 h-5 text-primary" />
          Central de Projetos & Leads
        </CardTitle>
        <p className="text-xs text-slate-500 mt-1">Identifique o cliente para que o orçamento seja salvo como uma oportunidade na nuvem.</p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Identidade do Lead */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold text-primary flex items-center gap-1.5 ml-1">
              <User className="w-3 h-3" /> Nome do Cliente
            </label>
            <input
              type="text"
              placeholder="Ex: John Doe"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-xl border-dashed border-2 border-primary/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold text-primary flex items-center gap-1.5 ml-1">
              <Mail className="w-3 h-3" /> E-mail de Contato
            </label>
            <input
              type="email"
              placeholder="cliente@email.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full rounded-xl border-dashed border-2 border-primary/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all font-medium"
            />
          </div>
        </div>

        {/* Título do Projeto e Botão de Salvar */}
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5 ml-1">
              <Tag className="w-3 h-3" /> Título do Orçamento / Projeto
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Ex: Casa em Windermere v.1"
                value={newComboName}
                onChange={(e) => setNewComboName(e.target.value)}
                className="flex-1 rounded-xl border-0 py-3 pl-4 text-slate-900 bg-slate-50 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 font-semibold transition-all shadow-inner"
              />
              <Button 
                onClick={handleSaveCurrent} 
                disabled={!newComboName.trim() || isSaving} 
                className="h-[48px] px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-bold tracking-wide flex items-center gap-2 group transition-all"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Cloud className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Salvar Lead
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {combos.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Projetos Recentes (Local)</h4>
            <div className="grid grid-cols-1 gap-2">
              {combos.map(combo => (
                <div key={combo.id} className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-primary/20 bg-slate-50/10 hover:bg-white transition-all shadow-sm hover:shadow-md">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">{combo.name}</span>
                    <div className="flex items-center gap-3">
                      {combo.clientName && (
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                          <User className="w-2.5 h-2.5" /> {combo.clientName}
                        </span>
                      )}
                      {combo.clientEmail && (
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                          <Mail className="w-2.5 h-2.5" /> {combo.clientEmail}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleLoad(combo)} className="text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg h-9 w-9">
                      <FolderOpen className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(combo.id)} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg h-9 w-9">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
