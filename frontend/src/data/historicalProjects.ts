import db from './db.json'
import type { RoomType } from '../store/useBudgetStore'

export type Category =
  | 'CONSTRUCAO'
  | 'MOVEIS'
  | 'PRODUTOS'
  | 'MAO_DE_OBRA'
  | 'MAO_DE_OBRA_G'
  | 'EXTRAS'
  | 'DECORACAO'
  | 'PACOTES_TEMATICOS'

export interface CategoryData {
  priceCost: number
  // null quando não há Actual Cost registrado para esta categoria
  actualCost: number | null
  // 0.0 a 1.0 — proporção de itens com Actual Cost preenchido
  coverage: number
}

export interface HistoricalRoom {
  name: string
  type: RoomType | 'Área Comum' | 'Banheiro' | 'Lanai' | 'Extras' | 'Loft' | 'Garagem / Cinema' | 'Adulto'
  totalBudget: number
  // null quando nenhum item do cômodo tem Actual Cost preenchido
  totalActual: number | null
  coverage: number
}

export interface HistoricalProject {
  id: string
  // Nome de exibição do projeto
  name: string
  // Soma de todos os Price Cost (sempre disponível)
  totalPriceCost: number
  // Soma dos Actual Cost reais — null quando cobertura = 0
  totalActualCost: number | null
  // 0.0 a 1.0 — proporção de itens com Actual Cost preenchido
  coverage: number
  // true somente se coverage >= 50% (desvio confiável para análise)
  deviationReliable: boolean
  rooms: HistoricalRoom[]
  thematicCount: number
  adultCount: number
  loftCount: number
  gameRoomCount: number
  hasLanai: boolean
  categoryBreakdown: Partial<Record<Category, CategoryData>>
}

// Mapeia o db.json gerado por pro_extract.py para o tipo HistoricalProject.
// Nenhum valor usa Price Cost como fallback para Actual Cost.
export const HISTORICAL_PROJECTS: HistoricalProject[] = (db as any[]).map(p => ({
  id:                p.id,
  name:              p.title,
  totalPriceCost:    p.budget,
  totalActualCost:   p.actual ?? null,    // null se sem dados reais
  coverage:          p.coverage ?? 0,
  deviationReliable: p.deviationReliable ?? false,
  thematicCount:     p.thematicCount,
  adultCount:        p.adultCount,
  loftCount:         p.loftCount,
  gameRoomCount:     p.gameRoomCount ?? p.loftCount,
  hasLanai:          p.hasLanai,
  rooms: (p.rooms ?? []).map((r: any) => ({
    name:        r.name,
    type:        r.type,
    totalBudget: r.totalBudget ?? 0,
    totalActual: r.totalActual ?? null,  // null quando cômodo sem Actual
    coverage:    r.coverage ?? 0,
  })),
  categoryBreakdown: Object.entries(p.categoryBreakdown ?? {}).reduce(
    (acc: any, [cat, vals]: any) => {
      acc[cat] = {
        priceCost:  vals.priceCost,
        actualCost: vals.actualCost ?? null,  // null, nunca usa priceCost como fallback
        coverage:   vals.coverage ?? 0,
      }
      return acc
    },
    {}
  ),
}))
