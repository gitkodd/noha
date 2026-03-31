import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface ProjectItem {
  id: string;
  name: string;
  product: string;   // alias para compatibilidade com ProjectList.tsx
  category: string;
  price: number;     // alias para priceCost
  actual: number | null;  // alias para actualCost
  quantity: number | null;
  unitPrice: number | null;
  link: string | null;
}

export interface ProjectRoom {
  id: string;
  name: string;
  type: string;
  items: ProjectItem[];
  totalPrice: number;       // alias para totalBudget
  totalActual: number;      // 0 quando sem dados reais (nunca null na store, facilita UI)
  coverage: number;
}

export interface Project {
  id: string;
  name: string;
  clientName?: string;
  clientEmail?: string;
  passportNumber?: string;
  clientAddress?: string;
  vacationHomeAddress?: string;
  status: 'draft' | 'sent' | 'approved' | 'in_progress' | 'completed';
  contractUrl?: string;
  installmentDates?: Record<string, string>;
  budgetData?: any;
  rooms: ProjectRoom[];
  totalPrice: number;    // alias para budget
  totalActual: number;   // 0 quando null (Lilian), facilita UI
  coverage: number;
  deviationReliable: boolean;
  roomCount: number;
  thematicCount: number;
  adultCount: number;
  loftCount: number;
  gameRoomCount: number;
  hasLanai: boolean;
  date: string;
}

interface ProjectState {
  projects: Project[];
  selectedProjectId: string | null;
  isLoading: boolean;
  
  // Actions
  setSelectedProject: (id: string | null) => void;
  getProjectById: (id: string) => Project | undefined;
  fetchProjects: () => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<string | null>;
  updateProject: (id: string, data: Partial<Project>) => Promise<boolean>;
  getGlobalStats: () => {
    totalProjects: number;
    avgAccuracy: number;
    totalPrice: number;
    totalActual: number;
  };
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProjectId: null,
  isLoading: false,

  setSelectedProject: (id) => set({ selectedProjectId: id }),

  getProjectById: (id) => get().projects.find(p => p.id === id),

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      // Fetch projects with their rooms and items in a single query
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          rooms (
            *,
            items (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedProjects: Project[] = (data || []).map(p => ({
        id: p.id,
        name: p.title,
        clientName: p.client_name,
        clientEmail: p.client_email,
        passportNumber: p.passport_number,
        clientAddress: p.client_address,
        vacationHomeAddress: p.vacation_home_address,
        status: p.status || 'draft',
        contractUrl: p.contract_url,
        installmentDates: p.installment_dates,
        budgetData: p.budget_data,
        totalPrice: Number(p.budget) || 0,
        totalActual: Number(p.actual) || 0,
        coverage: p.coverage || 0,
        deviationReliable: p.deviation_reliable || false,
        roomCount: p.room_count || 0,
        thematicCount: p.thematic_count || 0,
        adultCount: p.adult_count || 0,
        loftCount: p.loft_count || 0,
        gameRoomCount: p.game_room_count || 0,
        hasLanai: p.has_lanai || false,
        date: p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '',
        rooms: (p.rooms || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          type: r.type,
          totalPrice: r.total_budget,
          totalActual: r.total_actual,
          coverage: r.coverage,
          items: (r.items || []).map((i: any) => ({
            id: i.id,
            name: i.name,
            product: i.name,
            category: i.category,
            price: i.unit_price * i.quantity,
            actual: i.actual_cost,
            quantity: i.quantity,
            unitPrice: i.unit_price,
            link: i.link
          }))
        }))
      }));

      set({ projects: mappedProjects, isLoading: false });
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      set({ isLoading: false });
    }
  },

  createProject: async (data) => {
    try {
      const { data: newProject, error } = await supabase
        .from('projects')
        .insert([{
          title: data.name,
          client_name: data.clientName,
          client_email: data.clientEmail,
          status: data.status || 'draft',
          budget: data.totalPrice,
          actual: data.totalActual || 0,
          budget_data: data.budgetData,
          room_count: data.roomCount,
          thematic_count: data.thematicCount,
          adult_count: data.adultCount,
          loft_count: data.loftCount,
          game_room_count: data.gameRoomCount,
          has_lanai: data.hasLanai,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      await get().fetchProjects();
      return newProject.id;
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      return null;
    }
  },

  updateProject: async (id, data) => {
    try {
      const updateData: any = {};
      if (data.clientName) updateData.client_name = data.clientName;
      if (data.clientEmail) updateData.client_email = data.clientEmail;
      if (data.passportNumber) updateData.passport_number = data.passportNumber;
      if (data.clientAddress) updateData.client_address = data.clientAddress;
      if (data.vacationHomeAddress) updateData.vacation_home_address = data.vacationHomeAddress;
      if (data.status) updateData.status = data.status;
      if (data.installmentDates) updateData.installment_dates = data.installmentDates;
      if (data.budgetData) updateData.budget_data = data.budgetData;
      
      // Update summary fields for the card
      if (data.name) updateData.title = data.name;
      if (data.totalPrice !== undefined) updateData.budget = data.totalPrice;
      if (data.roomCount !== undefined) updateData.room_count = data.roomCount;
      if (data.thematicCount !== undefined) updateData.thematic_count = data.thematicCount;
      if (data.adultCount !== undefined) updateData.adult_count = data.adultCount;
      if (data.loftCount !== undefined) updateData.loft_count = data.loftCount;
      if (data.gameRoomCount !== undefined) updateData.game_room_count = data.gameRoomCount;
      if (data.hasLanai !== undefined) updateData.has_lanai = data.hasLanai;

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      await get().fetchProjects();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      return false;
    }
  },

  getGlobalStats: () => {
    const projects = get().projects.filter(p => p.status !== 'draft');
    const reliable  = projects.filter(p => p.deviationReliable);
    const totalProjects = projects.length;
    const totalPrice    = projects.reduce((sum, p) => sum + p.totalPrice, 0);
    const totalActual   = reliable.reduce((sum, p) => sum + p.totalActual, 0);
    const totalBudgetReliable = reliable.reduce((sum, p) => sum + p.totalPrice, 0);

    const avgAccuracy = totalBudgetReliable > 0
      ? (totalActual / totalBudgetReliable) * 100
      : 100;

    return { totalProjects, avgAccuracy, totalPrice, totalActual };
  }
}));
