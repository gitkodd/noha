import { useProjectStore } from '../../store/useProjectStore';
import { useBudgetStore } from '../../store/useBudgetStore';
import { 
  FolderOpen, 
  User, 
  Mail, 
  Calendar, 
  Layers, 
  Search,
  Loader2,
  Plus
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface SavedBudgetsProps {
  onContinueEditing: () => void;
  onNewBudget: () => void;
}

export function SavedBudgets({ onContinueEditing, onNewBudget }: SavedBudgetsProps) {
  const { projects, isLoading, fetchProjects } = useProjectStore();
  const { loadState, resetBudget } = useBudgetStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filtrar apenas rascunhos (leads ativos) que NÃO tenham dados reais
  const drafts = projects.filter(p => 
    p.status === 'draft' && 
    p.totalActual === 0 &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (p.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleContinue = (project: any) => {
    // 1. Resetar estado atual
    resetBudget();
    
    // 2. Carregar dados do projeto salvo
    if (project.budgetData) {
      loadState({
        clientName: project.clientName || project.name,
        clientEmail: project.clientEmail || '',
        rooms: project.budgetData.rooms || [],
        lanai: project.budgetData.lanai || { telao: false, summerKitchen: false, telaPrivacidade: false },
        editingProjectId: project.id
      });
    } else {
      loadState({
        clientName: project.clientName || project.name,
        clientEmail: project.clientEmail || '',
        rooms: (project.rooms || []).map((r: any) => ({
          id: r.id,
          type: r.type,
          tier: 'basic',
          quantity: 1
        })),
        editingProjectId: project.id
      });
    }

    // 3. Navegar para a aba de orçamentos
    onContinueEditing();
  };

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Acessando Banco de Leads...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header com Stats integradas */}
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Orçamentos & Leads</h2>
            <p className="text-slate-500 text-sm">Gerencie seus leads e continue propostas em aberto.</p>
          </div>
          
          <button
            onClick={onNewBudget}
            className="group px-8 py-3.5 rounded-full bg-primary text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all duration-300 flex items-center gap-3 active:scale-95"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
              <Plus className="w-3.5 h-3.5" />
            </div>
            Criar Novo Orçamento
          </button>
        </div>
      </div>

      {/* Busca */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text"
          placeholder="Buscar por cliente, e-mail ou projeto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all text-sm font-semibold shadow-sm"
        />
      </div>

      {/* Grid de Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drafts.map((project) => (
          <div
            key={project.id}
            className="group bg-white border border-slate-200 rounded-[2.5rem] p-8 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative flex flex-col h-full"
          >
            <div className="flex-1">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase font-black text-slate-400 mb-0.5">Criado em</p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 justify-end">
                    <Calendar className="w-3 h-3" />
                    {project.date}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-black text-slate-900 mb-1 leading-none tracking-tight group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <div className="flex items-center gap-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <Mail className="w-3 h-3" />
                    {project.clientEmail || 'Não informado'}
                  </p>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    project.status === 'draft' ? 'bg-slate-50 text-slate-400 border-slate-200' :
                    project.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    'bg-primary/5 text-primary border-primary/20'
                  }`}>
                    {project.status === 'draft' ? 'Rascunho' : 
                     project.status === 'approved' ? 'Aprovado' : 
                     project.status === 'sent' ? 'Enviado' : 'Em andamento'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                  <p className="text-[8px] uppercase font-bold text-slate-400 mb-1">Ambientes</p>
                  <p className="text-sm font-black text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    {project.roomCount}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                  <p className="text-[8px] uppercase font-bold text-slate-400 mb-1">Total</p>
                  <p className="text-sm font-black text-slate-700">${project.totalPrice.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 flex items-center gap-3">
              <button 
                onClick={() => handleContinue(project)}
                className="flex-1 bg-primary hover:bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/10 group-hover:scale-[1.02]"
              >
                <FolderOpen className="w-4 h-4" /> Retomar Orçamento
              </button>
            </div>

            {/* Marcador Visual */}
            <div className="absolute top-8 left-1.5 w-1 h-12 bg-amber-400 rounded-full"></div>
          </div>
        ))}

        {drafts.length === 0 && !isLoading && (
          <div className="col-span-full py-40 text-center bg-slate-50 border border-dashed border-slate-200 rounded-[3rem]">
            <FolderOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum orçamento salvo por enquanto</h3>
          </div>
        )}
      </div>
    </div>
  );
}
