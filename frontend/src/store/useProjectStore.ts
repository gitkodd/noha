import { create } from 'zustand';
import db from '../data/db.json';

export interface ProjectItem {
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
  categoryBreakdown: Record<string, { priceCost: number, actualCost: number }>;
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
  categoryBreakdown: Record<string, { priceCost: number, actualCost: number }>;
  date: string;
}

interface ProjectState {
  projects: Project[];
  selectedProjectId: string | null;
  
  // Actions
  setSelectedProject: (id: string | null) => void;
  getProjectById: (id: string) => Project | undefined;
  getGlobalStats: () => {
    totalProjects: number;
    avgAccuracy: number;
    totalPrice: number;
    totalActual: number;
  };
}

function mapItem(i: any): ProjectItem {
  return {
    name:      i.name || i.product || '',
    product:   i.name || i.product || '',  // ProjectList usa .product
    category:  i.category || '',
    price:     i.priceCost ?? i.price ?? 0,
    actual:    i.actualCost !== undefined ? i.actualCost : (i.actual !== undefined ? i.actual : null),
    quantity:  i.quantity ?? null,
    unitPrice: i.unitPrice ?? null,
    link:      i.link ?? null,
  };
}

function mapRoom(r: any, projectId: string, idx: number): ProjectRoom {
  const items = (r.items ?? []).map(mapItem);
  const totalBudget = r.totalBudget ?? r.totalPrice ?? items.reduce((s: number, i: any) => s + (i.price || 0), 0);
  const totalActual = r.totalActual ?? 0;  // null → 0 para evitar NaN na UI

  return {
    id:             `${projectId}_room_${idx}`,
    name:           r.name || '',
    type:           r.type || 'Área Comum',
    items,
    totalPrice:     totalBudget,
    totalActual,
    coverage:       r.coverage ?? 0,
    categoryBreakdown: {},  // não usado na UI principal
  };
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: (db as any[]).map(p => {
    const rooms = (p.rooms ?? []).map((r: any, idx: number) => mapRoom(r, p.id, idx));
    return {
      id:               p.id,
      name:             p.title || p.name || '',
      rooms,
      totalPrice:       p.budget ?? 0,
      totalActual:      p.actual ?? 0,   // null → 0; Lilian mostrará $0 mas coverage=0% deixa claro
      coverage:         p.coverage ?? 0,
      deviationReliable: p.deviationReliable ?? false,
      roomCount:        p.roomCount ?? rooms.length,
      thematicCount:    p.thematicCount ?? 0,
      adultCount:       p.adultCount ?? 0,
      loftCount:        p.loftCount ?? 0,
      gameRoomCount:    p.gameRoomCount ?? p.loftCount ?? 0,
      hasLanai:         p.hasLanai ?? false,
      categoryBreakdown: {},
      date:             p.date || '2024–2025',
    } as Project;
  }),
  selectedProjectId: null,

  setSelectedProject: (id) => set({ selectedProjectId: id }),

  getProjectById: (id) => get().projects.find(p => p.id === id),

  getGlobalStats: () => {
    const projects = get().projects;
    const reliable  = projects.filter(p => p.deviationReliable);
    const totalProjects = projects.length;
    const totalPrice    = projects.reduce((sum, p) => sum + p.totalPrice, 0);
    const totalActual   = reliable.reduce((sum, p) => sum + p.totalActual, 0);
    const totalBudgetReliable = reliable.reduce((sum, p) => sum + p.totalPrice, 0);

    // Acurácia só sobre projetos com dados confiáveis
    const avgAccuracy = totalBudgetReliable > 0
      ? (totalActual / totalBudgetReliable) * 100
      : 100;

    return { totalProjects, avgAccuracy, totalPrice, totalActual };
  }
}));
