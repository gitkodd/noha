import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Switch } from './ui/Switch'
import { useBudgetStore, LANAI_PRICES } from '../store/useBudgetStore'
import { formatCurrency } from '../lib/utils'
import { Trees } from 'lucide-react'

export function LanaiOptions() {
  const { lanai, toggleLanai } = useBudgetStore()

  const options = [
    { id: 'telao', label: 'Telão Integrado', price: LANAI_PRICES.telao },
    { id: 'summerKitchen', label: 'Summer Kitchen Premium', price: LANAI_PRICES.summerKitchen },
    { id: 'telaPrivacidade', label: 'Tela de Privacidade (Privacy Screen)', price: LANAI_PRICES.telaPrivacidade },
  ] as const

  return (
    <Card className="w-full border-none shadow-xl bg-white rounded-2xl">
      <CardHeader className="pb-6 border-b border-slate-100">
        <CardTitle className="text-xl font-medium tracking-tight flex items-center gap-2 text-slate-800">
          <Trees className="w-5 h-5 text-primary" />
          Amenities Lanai
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {options.map((opt) => (
            <label key={opt.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:shadow-sm cursor-pointer hover:border-primary/20 transition-all bg-slate-50/30">
              <div className="flex flex-col">
                <span className="font-medium text-slate-800">{opt.label}</span>
                <span className="text-sm font-semibold text-primary/80 mt-0.5">+{formatCurrency(opt.price)}</span>
              </div>
              <Switch 
                checked={lanai[opt.id]} 
                onCheckedChange={() => toggleLanai(opt.id)} 
              />
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
