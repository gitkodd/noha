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
        totalPrice: p.budget,
        totalActual: p.actual,
        coverage: p.coverage,
        deviationReliable: p.deviation_reliable,
        roomCount: p.room_count,
        thematicCount: p.thematic_count,
        adult_count: p.adult_count, // Usando Snake case se necessário ou o mapeado
        adultCount: p.adult_count,
        loftCount: p.loft_count,
        gameRoomCount: p.game_room_count,
        hasLanai: p.has_lanai,
        date: new Date(p.created_at).getFullYear().toString(),
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

  getGlobalStats: () => {
    const projects = get().projects;
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

