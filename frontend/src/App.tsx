import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/useAuthStore';
import { LoginPage } from './components/auth/LoginPage';
import { RoomConfigurator } from './components/RoomConfigurator';
import { CommissionPanel } from './components/CommissionPanel';
import { SummaryPanel } from './components/SummaryPanel';
import { ApprovalStep } from './components/ApprovalStep';
import { ConfigModal } from './components/ConfigModal';
import { PrintLayout } from './components/PrintLayout';
import { IntelligenceDashboard } from './components/intelligence/IntelligenceDashboard';
import { ProjectList } from './components/projects/ProjectList';
import { Home, Briefcase, Library, Brain, ChevronRight, Calculator, LogOut, Loader2 } from 'lucide-react';
import { useBudgetStore } from './store/useBudgetStore';

type AppPage = 'orcamentos' | 'inteligencia' | 'projetos'

const STEPS = [
  { id: 1, label: 'Ambientes\nBase', icon: Home },
  { id: 2, label: 'Políticas\nComerciais', icon: Briefcase },
  { id: 3, label: 'Aprovação\n& Mix', icon: Library },
]

function App() {
  const [activePage, setActivePage] = useState<AppPage>('orcamentos')
  const [activeStep, setActiveStep] = useState(1);
  const { user, isLoading, setAuth, signOut } = useAuthStore();
  const { printMode } = useBudgetStore();

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session?.user ?? null, session ?? null);
    });

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session?.user ?? null, session ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setAuth]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStep, activePage]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Not Authenticated -> Show LoginPage
  if (!user) {
    return <LoginPage />;
  }

  return (
    <>
    <div className="print:hidden min-h-screen bg-background text-foreground pb-20 font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="bg-primary sticky top-0 z-20 transition-all shadow-md">
        <div className="max-w-[1600px] w-full mx-auto px-4 py-4 sm:px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <img src="/logo.png" alt="NOHA Logo" className="h-8 w-auto object-contain" />
            <div className="h-6 w-px bg-white/30 hidden sm:block"></div>
            <h1 className="text-[10px] font-bold tracking-[0.2em] text-white/90 uppercase hidden sm:block">
              Orçamentos Digitais
            </h1>
          </div>

          {/* Navegação central */}
          <nav className="flex items-center bg-white/10 rounded-full p-1 gap-1">
            <button
              onClick={() => setActivePage('orcamentos')}
              className={`flex items-center gap-2 px-1.5 sm:px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                activePage === 'orcamentos'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Orçamentos</span>
            </button>
            <button
              onClick={() => setActivePage('projetos')}
              className={`flex items-center gap-2 px-1.5 sm:px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                activePage === 'projetos'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Projetos</span>
            </button>
            <button
              onClick={() => setActivePage('inteligencia')}
              className={`flex items-center gap-2 px-1.5 sm:px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                activePage === 'inteligencia'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Inteligência</span>
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground font-bold bg-white/20 px-3 py-1.5 rounded-full hidden lg:block shadow-sm">
              {user.email}
            </div>
            <button 
              onClick={() => signOut()}
              className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              title="Sair do Sistema"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <div className="h-6 w-px bg-white/30 hidden sm:block"></div>
            <ConfigModal />
          </div>
        </div>
      </header>

      {/* ── PÁGINA: PROJETOS ── */}
      {activePage === 'projetos' && (
        <main className="max-w-[1600px] w-full mx-auto px-4 py-10 sm:px-6 lg:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ProjectList />
        </main>
      )}

      {/* ── PÁGINA: INTELIGÊNCIA ── */}
      {activePage === 'inteligencia' && (
        <main className="max-w-[1600px] w-full mx-auto px-4 py-10 sm:px-6 lg:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <IntelligenceDashboard />
        </main>
      )}

      {/* ── PÁGINA: ORÇAMENTOS ── */}
      {activePage === 'orcamentos' && (
        <main className="max-w-[1600px] w-full mx-auto px-4 py-8 sm:px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            {/* Coluna esquerda */}
            <div className="w-full lg:w-[60%] relative">
              
              {/* Stepper */}
              <div className="mb-8 w-full">
                <nav aria-label="Progress">
                  <ol role="list" className="flex items-center w-full justify-between">
                    {STEPS.map((step, stepIdx) => (
                      <li key={step.id} className={`relative flex items-center ${stepIdx !== STEPS.length - 1 ? 'flex-1' : ''}`}>
                        <button
                          onClick={() => setActiveStep(step.id)}
                          className="group flex items-center gap-3 focus:outline-none shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <span className={`w-10 h-10 flex flex-col items-center justify-center rounded-full border-2 transition-all duration-300 ${
                            activeStep === step.id ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105' :
                            activeStep > step.id ? 'border-primary bg-primary/10 text-primary' :
                            'border-slate-200 bg-white text-slate-400 group-hover:border-slate-300'
                          }`}>
                            <step.icon className="w-4 h-4" />
                          </span>
                          <span className={`text-[11px] sm:text-[13px] font-semibold tracking-wide hidden sm:block whitespace-pre-line text-left leading-tight ${
                            activeStep === step.id ? 'text-slate-900' : 'text-slate-500'
                          }`}>
                            {step.label}
                          </span>
                        </button>

                        {stepIdx !== STEPS.length - 1 && (
                          <div className="flex-1 h-0.5 mx-3 sm:mx-6 bg-slate-200 hidden sm:block overflow-hidden rounded-full">
                            <div className={`h-full bg-primary transition-all duration-500 ease-out ${activeStep > step.id ? 'w-full' : 'w-0'}`}></div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                {activeStep === 1 && <RoomConfigurator />}
                {activeStep === 2 && <CommissionPanel />}
                {activeStep === 3 && <ApprovalStep />}
              </div>

              {/* Navegação entre steps */}
              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                <button
                  onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                  disabled={activeStep === 1}
                  className="px-6 py-2.5 rounded-full text-slate-500 font-medium hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  Voltar
                </button>
                {activeStep < 3 ? (
                  <button
                    onClick={() => setActiveStep(Math.min(3, activeStep + 1))}
                    className="px-8 py-2.5 rounded-full bg-slate-900 text-white font-medium hover:bg-black shadow-md shadow-slate-900/10 transition-all flex items-center gap-2 group"
                  >
                    Prosseguir para {STEPS[activeStep].label.split('\n')[0]} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActivePage('inteligencia')}
                    className="px-8 py-2.5 rounded-full bg-accent-intel text-accent-intel-foreground font-medium hover:bg-accent-intel/90 shadow-md shadow-accent-intel/20 transition-all flex items-center gap-2 group"
                  >
                    <Brain className="w-4 h-4" /> Ver Inteligência
                  </button>
                )}
              </div>
            </div>

            {/* Coluna direita — Summary fixo */}
            <div className="w-full lg:w-[40%]">
              <SummaryPanel />
            </div>
          </div>
        </main>
      )}
    </div>

    <PrintLayout mode={printMode} />
    </>
  )
}

export default App;
