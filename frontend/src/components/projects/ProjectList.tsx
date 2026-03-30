import { useProjectStore } from '../../store/useProjectStore';
import type { Project } from '../../store/useProjectStore';
import { 
  FolderOpen, 
  TrendingDown, 
  Calendar, 
  Layers, 
  ChevronRight, 
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Package,
  ExternalLink
} from 'lucide-react';
import { useState } from 'react';

export function ProjectList() {
  const { projects, selectedProjectId, setSelectedProject, getProjectById, getGlobalStats } = useProjectStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  const stats = getGlobalStats();
  const selectedProject = selectedProjectId ? getProjectById(selectedProjectId) : null;

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedProject) {
    return <ProjectDetailView project={selectedProject} onBack={() => setSelectedProject(null)} />;
  }

  return (
    <div className="space-y-8">
      {/* Header com Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Central de Projetos</h2>
          <p className="text-slate-500 mt-2">Dados históricos integrados da Noha 2.0</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm min-w-[140px]">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Total</p>
            <p className="text-2xl font-black text-slate-900">{stats.totalProjects}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm min-w-[140px]">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Acurácia Média</p>
            <p className={`text-2xl font-black ${stats.avgAccuracy < 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {stats.avgAccuracy.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text"
          placeholder="Buscar projeto por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
        />
      </div>

      {/* Grid de Projetos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const deviation = ((project.totalActual / project.totalPrice) - 1) * 100;
          const isEfficient = deviation <= 0;

          return (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project.id)}
              className="group bg-white border border-slate-200 rounded-3xl p-6 text-left hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
            >
              {/* Badge de Status */}
              <div className="flex items-center justify-between mb-6">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                  isEfficient ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {isEfficient ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {isEfficient ? 'Economia' : 'Gasto Extra'}
                </div>
                <div className="text-slate-300 group-hover:text-primary transition-colors">
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2">{project.name}</h3>
              
              <div className="flex items-center gap-4 text-slate-500 text-sm mb-6">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {project.date}
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  {project.roomCount} Ambientes
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-50 mb-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Orçado</p>
                  <p className="text-base font-bold text-slate-900">${project.totalPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Real</p>
                  <p className={`text-base font-bold ${isEfficient ? 'text-emerald-600' : 'text-amber-600'}`}>
                    ${project.totalActual.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">Acurácia Financeira</p>
                <p className={`text-sm font-black ${isEfficient ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {Math.abs(deviation).toFixed(1)}% {isEfficient ? 'abaixo' : 'acima'}
                </p>
              </div>

              {/* Decor visual */}
              <div className={`absolute bottom-0 right-0 w-24 h-24 -mr-8 -mb-8 rounded-full opacity-[0.03] transition-transform group-hover:scale-110 ${
                isEfficient ? 'bg-emerald-600' : 'bg-amber-600'
              }`}></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProjectDetailView({ project, onBack }: { project: Project, onBack: () => void }) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  
  const selectedRoom = selectedRoomId ? project.rooms.find(r => r.id === selectedRoomId) : project.rooms[0];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar para Lista
        </button>

        <div className="bg-white border border-slate-200 px-4 py-2 rounded-full flex items-center gap-3 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-[10px] font-black uppercase text-slate-900 tracking-tighter">Dados Verificados — BD1</span>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">{project.name}</h1>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <p className="text-[9px] uppercase font-bold text-white/50 mb-1">Ambientes totais</p>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <span className="font-bold">{project.roomCount} ambientes</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <p className="text-[9px] uppercase font-bold text-white/50 mb-1">Data de Execução</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-bold">{project.date}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 text-slate-900">
              <p className="text-[10px] uppercase font-black text-slate-400 mb-2">Total Orçado</p>
              <p className="text-3xl font-black">${project.totalPrice.toLocaleString()}</p>
            </div>
            <div className="bg-primary rounded-3xl p-6 text-white">
              <p className="text-[10px] uppercase font-black text-white/60 mb-2">Total Real Pago</p>
              <p className="text-3xl font-black">${project.totalActual.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Decor background */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Conteúdo Detalhado */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar: Lista de Ambientes */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Ambientes Detectados</h3>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{project.rooms.length}</span>
          </div>
          
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {project.rooms.map((room) => {
              const diff = ((room.totalActual / room.totalPrice) - 1) * 100;
              const isGreen = diff <= 0;
              const isActive = selectedRoomId === room.id || (!selectedRoomId && project.rooms[0].id === room.id);

              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full group p-4 rounded-2xl text-left border transition-all ${
                    isActive 
                      ? 'bg-white border-primary shadow-lg shadow-primary/5' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[13px] font-black ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                      {room.name}
                    </span>
                    {isActive ? (
                      <TrendingDown className={`w-4 h-4 ${isGreen ? 'text-emerald-500' : 'text-amber-500'}`} />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-all" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">${room.totalActual.toLocaleString()}</span>
                    <span className={`text-[10px] font-black ${isGreen ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {isGreen ? '' : '+'}{diff.toFixed(0)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detalhe do Ambiente Selecionado: Lista de Itens */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {selectedRoom ? (
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900">{selectedRoom.name}</h4>
                    <p className="text-slate-500 text-sm">Lista de compras e custos reais</p>
                  </div>
                </div>

                <div className="hidden sm:flex gap-3">
                  <div className="bg-slate-50 px-4 py-2 rounded-xl text-center">
                    <p className="text-[9px] uppercase font-bold text-slate-400">Orçado</p>
                    <p className="text-sm font-black text-slate-700">${selectedRoom.totalPrice.toLocaleString()}</p>
                  </div>
                  <div className="bg-primary/5 px-4 py-2 rounded-xl text-center border border-primary/10">
                    <p className="text-[9px] uppercase font-bold text-primary">Real</p>
                    <p className="text-sm font-black text-primary">${selectedRoom.totalActual.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Tabela de Itens */}
              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400">Produto</th>
                      <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400">Categoria</th>
                      <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 text-center">Qtd</th>
                      <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 text-right">Unitário</th>
                      <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 text-right">Total Orçado</th>
                      <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 text-right">Real Pago</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedRoom.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            {item.link ? (
                              <a 
                                href={item.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm font-bold text-primary hover:underline leading-tight inline-flex items-center gap-1 group"
                              >
                                {item.product || 'SEM NOME'}
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                            ) : (
                              <p className="text-sm font-bold text-slate-900 leading-tight">
                                {item.product || 'SEM NOME'}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <p className="text-sm font-medium text-slate-600">
                            {item.quantity ? Number(item.quantity).toFixed(0) : '1'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-medium text-slate-600">
                            ${item.unitPrice ? item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : (item.price / (item.quantity || 1)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-medium text-slate-400">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.actual !== null ? (
                            <p className={`text-sm font-black ${item.actual > item.price ? 'text-amber-600' : 'text-slate-900'}`}>
                              ${item.actual.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          ) : (
                            <div className="flex flex-col items-end">
                              <p className="text-sm font-bold text-slate-300">
                                ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </p>
                              <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Estimado</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {selectedRoom.items.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-slate-400 font-medium">Nenhum item detalhado neste ambiente.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] p-20 text-center">
              <FolderOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Selecione um ambiente para detalhar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
