import type { RoomType } from '../store/useBudgetStore'
import { HISTORICAL_PROJECTS, type HistoricalProject, type Category } from '../data/historicalProjects'

// ─── Tipos de resultado ──────────────────────────────────────────────────────

export interface SimilarProject {
  project: HistoricalProject
  score: number       // 0–100
  reasons: string[]   // por que é similar
}

export interface CategoryRisk {
  category: Category
  label: string
  avgDeviation: number // percentual médio de desvio (+/-)
  isMocked: boolean
}

export interface RoomDeviation {
  roomType: RoomType
  avgPriceCost: number
  avgActualCost: number
  deviationPct: number
  sampleSize: number
  isMocked: boolean
}

export interface DashboardKPIs {
  avgProjectCost: number
  totalProjects: number
  avgDeviation: number        // desvio médio geral (%)
  thematicRoomAvgCost: number
  adultRoomAvgCost: number
  categoryRisks: CategoryRisk[]
  projectComparisons: Array<{
    name: string
    priceCost: number
    actualCost: number
    deviationPct: number
    isMocked: boolean
  }>
}

// ─── Labels amigáveis das categorias ────────────────────────────────────────

export const CATEGORY_LABELS: Record<Category, string> = {
  CONSTRUCAO:    'Obra Civil',               // parede, piso, elétrica, hidráulica
  MOVEIS:        'Mobiliário & Marcenaria',  // móveis produzidos/comprados
  PRODUTOS:      'Produtos & Acessórios',    // Amazon, itens decorativos, small items
  MAO_DE_OBRA:   'M.O. de Instalação',      // marceneiro, instaladores específicos
  MAO_DE_OBRA_G: 'Gestão de Obra',          // equipe geral, coordenação, diaristas
  EXTRAS:        'Extras & Imprevistos',     // itens fora do escopo original
  DECORACAO:     'Decoração',               // acessórios finais, textura, arte
  PACOTES_TEMATICOS: 'Pacotes Temáticos',    // Itens de cenário e tematização
}

// ─── Engine de Similaridade ──────────────────────────────────────────────────

interface ProjectConfig {
  thematicCount: number
  adultCount: number
  loftCount: number
  gameRoomCount: number
  hasLanai: boolean
  estimatedCMV: number
}

function scoreSimilarity(config: ProjectConfig, project: HistoricalProject): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // Quartos totais (peso 30%)
  const totalConfig = config.thematicCount + config.adultCount + config.loftCount + config.gameRoomCount
  const totalProject = project.thematicCount + project.adultCount + project.loftCount + project.gameRoomCount
  const totalDiff = Math.abs(totalConfig - totalProject)
  const totalScore = Math.max(0, 30 - totalDiff * 5)
  score += totalScore
  if (totalDiff <= 1) reasons.push(`${totalProject} quartos no total`)

  // Temáticos (peso 25%)
  const thematicDiff = Math.abs(config.thematicCount - project.thematicCount)
  const thematicScore = Math.max(0, 25 - thematicDiff * 6)
  score += thematicScore
  if (thematicDiff === 0 && config.thematicCount > 0) reasons.push(`${project.thematicCount} quartos temáticos`)

  // Loft (peso 10%)
  if ((config.loftCount > 0) === (project.loftCount > 0)) {
    score += 10
    if (config.loftCount > 0) reasons.push('tem Loft')
  }

  // Game Room / Garagem (peso 10%)
  if ((config.gameRoomCount > 0) === (project.gameRoomCount > 0)) {
    score += 10
    if (config.gameRoomCount > 0) reasons.push('tem Game Room / Garagem')
  }

  // Lanai (peso 10%)
  if (config.hasLanai === project.hasLanai) {
    score += 10
    if (config.hasLanai) reasons.push('tem Lanai')
  }

  // Faixa de CMV (peso 15%)
  if (config.estimatedCMV > 0 && project.totalPriceCost > 0) {
    const cmvRatio = Math.min(config.estimatedCMV, project.totalPriceCost) /
                     Math.max(config.estimatedCMV, project.totalPriceCost)
    score += Math.round(cmvRatio * 15)
  }

  return { score: Math.min(100, Math.round(score)), reasons }
}

/** Retorna os top N projetos mais similares à configuração atual. */
export function getSimilarProjects(
  config: ProjectConfig,
  topN = 3
): SimilarProject[] {
  return HISTORICAL_PROJECTS
    .map(project => {
      const { score, reasons } = scoreSimilarity(config, project)
      return { project, score, reasons }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .filter(r => r.score > 10) // ignora similaridade irrelevante
}

// ─── Engine de Desvio por Categoria ─────────────────────────────────────────

/** Calcula o desvio médio por categoria em todos os projetos. */
export function getCategoryRisks(): CategoryRisk[] {
  const categories = Object.keys(CATEGORY_LABELS) as Category[]

  return categories.map(cat => {
    const deviations: number[] = []
    let hasMocked = false

    HISTORICAL_PROJECTS.forEach(project => {
      const data = project.categoryBreakdown[cat]
      // Só processa se tiver Actual Cost real (coverage > 0 garante que não é null)
      if (data && data.actualCost !== null && data.coverage > 0) {
        if (data.priceCost > 10) {
          const rawDeviation = ((data.actualCost - data.priceCost) / data.priceCost) * 100
          const cappedDeviation = Math.min(100, rawDeviation)
          deviations.push(cappedDeviation)
        } else if (data.priceCost <= 0 && data.actualCost > 0) {
          deviations.push(100)
        }
        // isMocked removido do schema — dados são sempre reais agora
      }
    })

    const avg = deviations.length > 0
      ? deviations.reduce((a, b) => a + b, 0) / deviations.length
      : 0

    return {
      category: cat,
      label: CATEGORY_LABELS[cat],
      avgDeviation: Math.round(avg * 10) / 10,
      isMocked: hasMocked,
    }
  })
}

/** Calcula o Buffer Sugerido para um tipo de cômodo (média dos desvios das categorias típicas). */
export function getRoomBuffer(roomType: RoomType): { bufferPct: number; isMocked: boolean } {
  const risks = getCategoryRisks()
  
  // Pesos reais baseados na composição das planilhas 2.0
  const weights: Partial<Record<Category, number>> = roomType === 'Quarto Temático'
    ? { PACOTES_TEMATICOS: 0.6, MOVEIS: 0.2, PRODUTOS: 0.1, DECORACAO: 0.1 }
    : roomType === 'Garagem' || roomType === 'Cinema'
    ? { CONSTRUCAO: 0.4, MOVEIS: 0.3, PRODUTOS: 0.2, MAO_DE_OBRA: 0.1 }
    : roomType === 'Loft'
    ? { PACOTES_TEMATICOS: 0.3, MOVEIS: 0.4, PRODUTOS: 0.2, DECORACAO: 0.1 }
    : { MOVEIS: 0.5, PRODUTOS: 0.2, DECORACAO: 0.2, MAO_DE_OBRA: 0.1 }

  let weightedBuffer = 0
  let totalWeight = 0
  let hasMocked = false

  for (const [cat, weight] of Object.entries(weights) as [Category, number][]) {
    const risk = risks.find(r => r.category === cat)
    if (risk) {
      // LÓGICA DE RISCO REAL:
      // Se o desvio médio é positivo (gastamos MAIS), o risco é o desvio real.
      // Se o desvio médio é negativo (gastamos MENOS), o risco é zero.
      // Isso evita que economias passadas sejam somadas como 'risco' e inflem o orçamento novo.
      const realRisk = risk.avgDeviation > 0 ? risk.avgDeviation : 0
      weightedBuffer += realRisk * weight
      totalWeight += weight
      if (risk.isMocked) hasMocked = true
    }
  }

  const buffer = totalWeight > 0 ? weightedBuffer / totalWeight : 0
  
  // Só sugere buffer se houver risco real identificado nos dados históricos (≥ 2.5%).
  // Arredonda para múltiplos de 5% (ex: 3% → 5%, 8% → 10%).
  // Se buffer < 2.5%, retorna 0: dados indicam que o orçamento é suficiente — não força falso alerta.
  const rounded = buffer >= 2.5 ? Math.round(buffer / 5) * 5 : 0

  return { bufferPct: Math.max(0, rounded), isMocked: hasMocked }
}

// ─── KPIs do Dashboard ───────────────────────────────────────────────────────

/** KPIs consolidados para a Central de Inteligência. */
export function getDashboardKPIs(): DashboardKPIs {
  const eligible = HISTORICAL_PROJECTS.filter(p => p.totalPriceCost > 0)

  const avgProjectCost = eligible.reduce((s, p) => s + p.totalPriceCost, 0) / eligible.length

  const projectComparisons = eligible.map(p => ({
    name: p.name,
    priceCost: p.totalPriceCost,
    actualCost: p.totalActualCost ?? 0,
    deviationPct: p.totalPriceCost > 0 && p.totalActualCost != null && p.totalActualCost > 0
      ? Math.round(((p.totalActualCost - p.totalPriceCost) / p.totalPriceCost) * 1000) / 10
      : 0,
    isMocked: false,         // isMocked removido do schema
    isPending: p.totalActualCost == null || p.coverage === 0
  }))

  const avgDeviation = projectComparisons.reduce((s, p) => s + p.deviationPct, 0) / projectComparisons.length

  // Custo médio por tipo de cômodo
  const thematicRooms = eligible.flatMap(p => p.rooms.filter(r => r.type === 'Quarto Temático'))
  const adultRooms = eligible.flatMap(p => p.rooms.filter(r => r.type === 'Adulto'))

  const avgThematic = thematicRooms.length > 0
    ? thematicRooms.reduce((s, r) => s + r.totalBudget, 0) / thematicRooms.length
    : 0
  const avgAdult = adultRooms.length > 0
    ? adultRooms.reduce((s, r) => s + r.totalBudget, 0) / adultRooms.length
    : 0

  return {
    avgProjectCost: Math.round(avgProjectCost),
    totalProjects: eligible.length,
    avgDeviation: Math.round(avgDeviation * 10) / 10,
    thematicRoomAvgCost: Math.round(avgThematic),
    adultRoomAvgCost: Math.round(avgAdult),
    categoryRisks: getCategoryRisks(),
    projectComparisons,
  }
}
