import { useState } from 'react';
import { useBudgetStore } from '../../store/useBudgetStore';
import { formatCurrency } from '../../lib/utils';
import { X, User, MapPin, CreditCard, Calendar, FileText } from 'lucide-react';

interface ContractFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  sellPrice: number;
}

export function ContractFormModal({ isOpen, onClose, onSave, sellPrice }: ContractFormModalProps) {
  const { rooms } = useBudgetStore();
  const totalWithTax = sellPrice * 1.065;
  
  const [formData, setFormData] = useState({
    clientName: '',
    passportNumber: '',
    clientEmail: '',
    clientAddress: '',
    vacationHomeAddress: '',
    installments: [
      { date: '', value: totalWithTax * 0.40, label: '1ª Parcela (40%)' },
      { date: '', value: totalWithTax * 0.30, label: '2ª Parcela (30%)' },
      { date: '', value: totalWithTax * 0.20, label: '3ª Parcela (20%)' },
      { date: '', value: totalWithTax * 0.10, label: '4ª Parcela (10%)' },
    ]
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDateChange = (index: number, date: string) => {
    const newInstallments = [...formData.installments];
    newInstallments[index].date = date;
    setFormData({ ...formData, installments: newInstallments });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Formalização de Contrato</h2>
              <p className="text-xs text-slate-500 font-medium tracking-tight">Preencha os dados da Débora Packer (Contratante)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 space-y-8 flex-1 custom-scrollbar">
          
          {/* Seção 1: Dados do Cliente */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Identificação e Contato
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nome Completo</label>
                <input 
                  required
                  type="text" 
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  placeholder="Nome do contratante"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Passport / ID</label>
                <input 
                  required
                  type="text" 
                  value={formData.passportNumber}
                  onChange={(e) => setFormData({...formData, passportNumber: e.target.value})}
                  placeholder="Nº do documento"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm font-medium"
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">E-mail</label>
                <input 
                  required
                  type="email" 
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                  placeholder="email@exemplo.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Endereços */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> Endereços (Residência & Obra)
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Endereço Principal</label>
                <input 
                  required
                  type="text" 
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({...formData, clientAddress: e.target.value})}
                  placeholder="Rua, Número, Cidade, Estado, CEP"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Endereço da Obra (Vacation Home)</label>
                <input 
                  required
                  type="text" 
                  value={formData.vacationHomeAddress}
                  onChange={(e) => setFormData({...formData, vacationHomeAddress: e.target.value})}
                  placeholder="Endereço nos EUA (ex: Kissimmee, Reunion)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Pagamento */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5" /> Plano de Pagamento (Total: {formatCurrency(sellPrice)})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.installments.map((inst, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{inst.label}</span>
                    <span className="text-sm font-bold text-slate-800">{formatCurrency(inst.value)}</span>
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      required
                      type="date" 
                      value={inst.date}
                      onChange={(e) => handleDateChange(idx, e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
             <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
               * Ao salvar, os cômodos ({rooms.map(r => r.type).join(', ')}) serão vinculados ao contrato dinamicamente.
             </p>
          </div>

        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-200 transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            className="flex-[2] px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            Gerar e Salvar Contrato
          </button>
        </div>

      </div>
    </div>
  );
}

