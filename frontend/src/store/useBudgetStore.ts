import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RoomType = 'Quarto Temático' | 'Quarto Normal' | 'Loft' | 'Garagem' | 'Cinema' | 'Delphino'
export type TierType = 'basic' | 'intermediario' | 'premium'

export const DEFAULT_ROOM_BASE_PRICES: Record<RoomType, number> = {
  'Quarto Temático': 12000,
  'Quarto Normal': 4000,
  'Loft': 14000,
  'Garagem': 18000,
  'Cinema': 18000,
  'Delphino': 2000,
}

export const ROOM_HISTORY: Record<RoomType, number | null> = {
  'Quarto Temático': 11804,
  'Quarto Normal': 3879,
  'Loft': 13990,
  'Garagem': 17189,
  'Cinema': 17189,
  'Delphino': null,
}

export const LANAI_PRICES = {
  telao: 12500,
  summerKitchen: 6000,
  telaPrivacidade: 3000,
}

export const LANAI_HISTORY = {
  telao: 11805,
  summerKitchen: 5789,
  telaPrivacidade: 2890,
}

export interface RoomItem {
  id: string;
  type: RoomType;
  tier: TierType;
  quantity: number;
  customPrice?: number | null;
}

export interface LanaiOptions {
  telao: boolean;
  summerKitchen: boolean;
  telaPrivacidade: boolean;
  telaoCustomPrice?: number | null;
  summerKitchenCustomPrice?: number | null;
  telaPrivacidadeCustomPrice?: number | null;
}

export interface CommissionSettings {
  markup: { enabled: boolean };
  ingrid: { enabled: boolean };
  corretor: { enabled: boolean };
  tati: { enabled: boolean };
  indicacao: { enabled: boolean };
}

export interface CommissionRates {
  markup: number;
  ingrid: number;
  corretor: number;
  tati: number;
  indicacao: number;
}

export interface GlobalSettings {
  tierBasic: number; // percentage e.g. -15
  tierPremium: number; // percentage e.g. 15
  decorationPercent: Record<RoomType, number>; // percentage per room
  roomBasePrices: Record<RoomType, number>;
  commissionRates: CommissionRates;
}

export interface BudgetState {
  globalSettings: GlobalSettings;
  rooms: RoomItem[];
  lanai: LanaiOptions;
  commissions: CommissionSettings;
  showHistory: boolean;
  printMode: 'client' | 'internal' | null;
  
  // Actions
  addRoom: (type: RoomType, id?: string) => void;
  updateRoom: (id: string, updates: Partial<RoomItem>) => void;
  removeRoom: (id: string) => void;
  toggleLanai: (item: keyof LanaiOptions) => void;
  updateLanaiPrice: (item: keyof LanaiOptions, price: number | null) => void;
  updateCommission: (key: keyof CommissionSettings, enabled?: boolean) => void;
  toggleHistory: () => void;
  setPrintMode: (mode: 'client' | 'internal' | null) => void;
  loadState: (state: Partial<BudgetState>) => void;
  updateGlobalSettings: (updates: Partial<GlobalSettings>) => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      globalSettings: {
        tierBasic: -15,
        tierPremium: 15,
        decorationPercent: {
          'Quarto Temático': 5,
          'Quarto Normal': 5,
          'Loft': 5,
          'Garagem': 5,
          'Cinema': 5,
          'Delphino': 5,
        },
        roomBasePrices: { ...DEFAULT_ROOM_BASE_PRICES },
        commissionRates: {
          markup: 40,
          ingrid: 10,
          corretor: 10,
          tati: 2,
          indicacao: 5,
        }
      },
      rooms: [],
      lanai: {
        telao: false,
        summerKitchen: false,
        telaPrivacidade: false,
        telaoCustomPrice: null,
        summerKitchenCustomPrice: null,
        telaPrivacidadeCustomPrice: null,
      },
      commissions: {
        markup: { enabled: true },
        ingrid: { enabled: true },
        corretor: { enabled: true },
        tati: { enabled: true },
        indicacao: { enabled: false },
      },
      showHistory: true,
      printMode: null,

      addRoom: (type, id) => set((state) => ({
        rooms: [...state.rooms, { id: id || crypto.randomUUID(), type, tier: 'intermediario', quantity: 1 }]
      })),
      
      updateRoom: (id, updates) => set((state) => ({
        rooms: state.rooms.map(r => r.id === id ? { ...r, ...updates } : r)
      })),

      removeRoom: (id) => set((state) => ({
        rooms: state.rooms.filter(r => r.id !== id)
      })),

      toggleLanai: (item) => set((state) => ({
        lanai: { ...state.lanai, [item]: !state.lanai[item] }
      })),

      updateLanaiPrice: (item, price) => set((state) => ({
        lanai: { ...state.lanai, [item]: price }
      })),

      updateCommission: (key, enabled) => set((state) => ({
        commissions: {
          ...state.commissions,
          [key]: {
            ...state.commissions[key],
            enabled: enabled !== undefined ? enabled : state.commissions[key].enabled,
          }
        }
      })),

      toggleHistory: () => set((state) => ({
        showHistory: !state.showHistory
      })),

      setPrintMode: (mode) => set({ printMode: mode }),

      loadState: (newState) => set((state) => ({
        ...state,
        ...newState
      })),

      updateGlobalSettings: (updates) => set((state) => ({
        globalSettings: { ...state.globalSettings, ...updates }
      })),
    }),
    {
      name: 'noha-budget-storage', // saves to local storage
    }
  )
)
