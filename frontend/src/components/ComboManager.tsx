import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { useBudgetStore, type RoomItem, type LanaiOptions } from '../store/useBudgetStore'
import { Save, FolderOpen, Trash2, Library } from 'lucide-react'

interface Combo {
  id: string;
  name: string;
  rooms: RoomItem[];
  lanai: LanaiOptions;
}

const STORAGE_KEY = '@noha-budget/combos'

export function ComboManager() {
  const { rooms, lanai, loadState } = useBudgetStore()
  const [combos, setCombos] = useState<Combo[]>([])
  const [newComboName, setNewComboName] = useState('')

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

  const handleSaveCurrent = () => {
    if (!newComboName.trim()) return
    const combo: Combo = {
      id: crypto.randomUUID(),
      name: newComboName.trim(),
      rooms: JSON.parse(JSON.stringify(rooms)),
      lanai: JSON.parse(JSON.stringify(lanai)),
    }
    saveCombos([...combos, combo])
    setNewComboName('')
  }

  const handleLoad = (combo: Combo) => {
    if (confirm(`Deseja carregar o combo "${combo.name}"? Isso substituirá sua configuração atual.`)) {
      loadState({
        rooms: JSON.parse(JSON.stringify(combo.rooms)),
        lanai: JSON.parse(JSON.stringify(combo.lanai)),
      })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Excluir este combo?')) {
      saveCombos(combos.filter(c => c.id !== id))
    }
  }

  return (
    <Card className="w-full border-none shadow-xl bg-white rounded-2xl">
      <CardHeader className="pb-6 border-b border-slate-100">
        <CardTitle className="text-xl font-medium tracking-tight flex items-center gap-2 text-slate-800">
          <Library className="w-5 h-5 text-primary" />
          Gerenciador de Projetos (Combos)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Nome da configuração..."
            value={newComboName}
            onChange={(e) => setNewComboName(e.target.value)}
            className="flex-1 rounded-xl border-0 py-2.5 pl-4 text-slate-900 bg-slate-50 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 font-medium transition-all"
          />
          <Button onClick={handleSaveCurrent} disabled={!newComboName.trim()} className="h-[44px] px-5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-medium tracking-wide">
            <Save className="w-4 h-4 mr-2" /> Salvar Mix
          </Button>
        </div>

        {combos.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Combos Salvos</h4>
            {combos.map(combo => (
              <div key={combo.id} className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-primary/20 bg-slate-50/50 hover:bg-primary/5 transition-all">
                <span className="text-sm font-semibold text-slate-700">{combo.name}</span>
                <div className="flex items-center space-x-1 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => handleLoad(combo)} className="text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg">
                    <FolderOpen className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(combo.id)} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
