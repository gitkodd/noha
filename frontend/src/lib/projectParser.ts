import type { RoomType } from '../store/useBudgetStore'

// Palavras-chave que identificam quartos temáticos pelo nome do ambiente
const THEMATIC_KEYWORDS = [
  'minion', 'frozen', 'mickey', 'minie', 'harry potter', 'avenger',
  'rapunzel', 'princesa', 'princess', 'london', 'londre', 'nintendo',
  'mario', 'safari', 'pokemon', 'marvel', 'disney', 'nemo', 'toy story',
  'star wars', 'batman', 'spider', 'hulk', 'moana', 'encanto',
]

const NORMAL_KEYWORDS = [
  'master', 'bege', 'cinza', 'gray', 'beige', 'adulto', 'normal',
]

const GAME_ROOM_KEYWORDS = [
  'game room', 'garagem', 'garage', 'pub', 'billiard', 'cinema',
]

const LOFT_KEYWORDS = ['loft']

const LANAI_KEYWORDS = ['lanai', 'lana']

const SOCIAL_KEYWORDS = [
  'foyer', 'kitchen', 'living', 'dinning', 'dining', 'laundry',
  'lavabo', 'powder',
]

const BATHROOM_KEYWORDS = ['bathroom', 'banheiro', 'bath']

/** Classifica um nome de ambiente em um tipo de cômodo. */
export function classifyRoom(ambientName: string): RoomType | 'area_social' | 'banheiro' | 'lanai' | 'extras' {
  const lower = ambientName.toLowerCase()

  if (LOFT_KEYWORDS.some(k => lower.includes(k))) return 'Loft'
  if (GAME_ROOM_KEYWORDS.some(k => lower.includes(k))) return 'Garagem'
  if (LANAI_KEYWORDS.some(k => lower.includes(k))) return 'lanai'
  if (BATHROOM_KEYWORDS.some(k => lower.includes(k))) return 'banheiro'
  if (SOCIAL_KEYWORDS.some(k => lower.includes(k))) return 'area_social'

  // Bedroom: precisa determinar se temático ou normal
  if (lower.includes('bedroom') || lower.includes('quarto')) {
    if (THEMATIC_KEYWORDS.some(k => lower.includes(k))) return 'Quarto Temático'
    if (NORMAL_KEYWORDS.some(k => lower.includes(k))) return 'Quarto Normal'
    // Bedroom sem indicador claro → normal (mais conservador)
    return 'Quarto Normal'
  }

  if (lower.includes('extra')) return 'extras'

  return 'area_social'
}

/** Verifica se o tipo é um cômodo que entra no orçamento principal. */
export function isBillableRoom(type: string): type is RoomType {
  return ['Quarto Temático', 'Quarto Normal', 'Loft', 'Garagem', 'Cinema', 'Delphino'].includes(type)
}
