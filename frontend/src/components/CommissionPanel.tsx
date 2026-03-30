import { BriefcaseBusiness, User, Target, Users } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Switch } from './ui/Switch'
import { useBudgetStore } from '../store/useBudgetStore'

export function CommissionPanel() {
  const { commissions, updateCommission, globalSettings } = useBudgetStore()
  const rates = globalSettings.commissionRates || { markup: 40, ingrid: 10, corretor: 10, tati: 2, indicacao: 5 }

  return (
    <Card className="w-full border-none shadow-xl bg-white rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
            <BriefcaseBusiness className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl text-slate-800">Participações & Margens</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Ligue ou deslique as alavancas comissionadas. (As taxas são fechadas em sistema Admin)</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 shrink-0 relative">
        {/* Mock Win-Rate Predictor */}
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 flex items-start gap-4 shadow-sm">
           <div className="p-2.5 bg-white rounded-xl shadow-sm border border-emerald-100 shrink-0">
             <Target className="w-5 h-5 text-emerald-600" />
           </div>
           <div>
             <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
               Machine Learning Win-Rate
               <span className="text-[9px] uppercase tracking-widest bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Beta</span>
             </h4>
             <p className="text-xs text-emerald-700 mt-1.5 leading-relaxed pr-4">
               Com o Markup corporativo atual travado em <strong>{rates.markup}%</strong>, a probabilidade de fechamento (Win-Rate) para este perfil de cliente é de <strong className="text-emerald-900 border-b border-emerald-300">82%</strong>. Uma redução estratégica para 35% elevaria a conversão para 91% historicamente.
             </p>
           </div>
        </div>

        <div className="space-y-4">
          
          <CommissionRow 
            icon={<Target className="w-4 h-4 text-slate-600" />}
            title="Markup Corporativo"
            description="Margem fixa aplicada sobre o subtotal do projeto."
            enabled={commissions.markup.enabled}
            percentage={rates.markup}
            onToggle={(v) => updateCommission('markup', v)}
          />

          <CommissionRow 
            icon={<User className="w-4 h-4 text-primary" />}
            title="Fee de Projeto"
            description="Fee relacionado à autoralidade de modelagem de interiores."
            enabled={commissions.ingrid.enabled}
            percentage={rates.ingrid}
            onToggle={(v) => updateCommission('ingrid', v)}
          />

          <div className="h-px bg-slate-100 my-6 w-full"></div>

          <CommissionRow 
            icon={<BriefcaseBusiness className="w-4 h-4 text-orange-500" />}
            title="Corretagem"
            description="Dedução aplicada ao final do formulário sobre o Gross."
            enabled={commissions.corretor.enabled}
            percentage={rates.corretor}
            onToggle={(v) => updateCommission('corretor', v)}
          />

          <CommissionRow 
            icon={<User className="w-4 h-4 text-accent-intel" />}
            title="Fee Operacional"
            description="Stakeholder corporativo."
            enabled={commissions.tati.enabled}
            percentage={rates.tati}
            onToggle={(v) => updateCommission('tati', v)}
          />

          <CommissionRow 
            icon={<Users className="w-4 h-4 text-emerald-500" />}
            title="Indicação Projeto"
            description="Porcentagem repassada a parceiros ou indutores de lead."
            enabled={commissions.indicacao.enabled}
            percentage={rates.indicacao}
            onToggle={(v) => updateCommission('indicacao', v)}
          />

        </div>
      </CardContent>
    </Card>
  )
}

function CommissionRow({ icon, title, description, enabled, percentage, onToggle }: {
  icon: React.ReactNode, title: string, description: string, enabled: boolean, percentage: number, onToggle: (enabled: boolean) => void
}) {
  return (
    <div className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${enabled ? 'bg-white shadow-sm border-slate-200' : 'bg-slate-50/50 border-transparent opacity-70'}`}>
      <div className="flex gap-4 sm:gap-5 items-center">
        <Switch 
          checked={enabled} 
          onCheckedChange={onToggle}
          className={enabled ? 'bg-primary' : 'bg-slate-200'}
        />
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg hidden sm:block">{icon}</div>
          <div>
            <h4 className="font-semibold text-slate-800 text-sm">{title}</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px] sm:max-w-xs">{description}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center bg-slate-100 rounded-lg px-3 py-2 border border-slate-200/50">
        <span className="text-sm font-bold text-slate-600">{percentage}%</span>
      </div>
    </div>
  )
}
