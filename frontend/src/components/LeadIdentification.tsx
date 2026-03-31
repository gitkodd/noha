import { useState } from 'react'
import { useBudgetStore } from '../store/useBudgetStore'
import { User, Mail, ChevronRight, Calculator, Sparkles } from 'lucide-react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

export function LeadIdentification() {
  const { setClientName, setClientEmail } = useBudgetStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const handleStart = () => {
    if (!name.trim()) {
      setError('Por favor, informe o nome do cliente.')
      return
    }
    if (!isValidEmail(email)) {
      setError('Por favor, informe um e-mail válido.')
      return
    }
    
    setClientName(name.trim())
    setClientEmail(email.trim())
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-12 overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />

      <Card className="relative w-full max-w-xl bg-white/95 border-0 shadow-2xl rounded-[2rem] overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-emerald-400 to-primary" />
        
        <div className="p-8 sm:p-12">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="bg-primary/10 p-4 rounded-3xl">
              <Calculator className="w-10 h-10 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-slate-800 uppercase">
                Novo Orçamento <span className="text-primary italic">Noha</span>
              </h2>
              <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                Para iniciar a configuração dos ambientes, identifique o <span className="text-slate-800 font-bold">lead</span> abaixo. Isso garante o acompanhamento comercial.
              </p>
            </div>

            <div className="w-full space-y-5 pt-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1 flex items-center gap-2">
                  <User className="w-3 h-3 text-primary" /> Nome do Cliente
                </label>
                <div className="relative group">
                   <input
                    type="text"
                    placeholder="Ex: Robert De Niro"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError('') }}
                    className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 text-base font-semibold text-slate-800 transition-all focus:border-primary focus:bg-white focus:ring-0 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center opacity-0 group-focus-within:opacity-100 transition-opacity">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1 flex items-center gap-2">
                  <Mail className="w-3 h-3 text-primary" /> E-mail de Contato
                </label>
                <input
                  type="email"
                  placeholder="cliente@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 text-base font-semibold text-slate-800 transition-all focus:border-primary focus:bg-white focus:ring-0 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                />
              </div>

              {error && (
                <p className="text-xs font-bold text-rose-500 animate-bounce">{error}</p>
              )}

              <Button 
                onClick={handleStart}
                className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-black shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 transition-all"
              >
                Iniciar Orçamento Digital <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
            <p className="text-[9px] uppercase tracking-[0.25em] text-slate-400 font-bold">
              Powered by NOHA Intelligence CRM
            </p>
        </div>
      </Card>
    </div>
  )
}
