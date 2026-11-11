const DATE_PREFIX_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/
const DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/
const EXPLICIT_TIMEZONE_PATTERN = /(Z|[+-]\d{2}:?\d{2})$/i
const MACEIO_TIME_ZONE = 'America/Maceio'

type DateValue = Date | string | null | undefined

function isValidCalendarParts(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day)

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export function formatDatePtBr(value: DateValue): string {
  if (!value) {
    return ''
  }

  if (typeof value === 'string') {
    const dateParts = DATE_PREFIX_PATTERN.exec(value.trim())

    if (dateParts) {
      const year = Number(dateParts[1])
      const month = Number(dateParts[2])
      const day = Number(dateParts[3])

      return isValidCalendarParts(year, month, day) ? `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}` : ''
    }
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('pt-BR', { timeZone: MACEIO_TIME_ZONE })
}

export function formatDateTimePtBr(value: DateValue): string {
  if (!value) {
    return ''
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim()
    const dateTimeParts = DATE_TIME_PATTERN.exec(normalizedValue)

    if (dateTimeParts && !EXPLICIT_TIMEZONE_PATTERN.test(normalizedValue)) {
      const year = Number(dateTimeParts[1])
      const month = Number(dateTimeParts[2])
      const day = Number(dateTimeParts[3])

      if (!isValidCalendarParts(year, month, day)) {
        return ''
      }

      const hour = dateTimeParts[4] ?? '00'
      const minute = dateTimeParts[5] ?? '00'
      const second = dateTimeParts[6] ?? '00'
      return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}, ${hour}:${minute}:${second}`
    }
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleString('pt-BR', { timeZone: MACEIO_TIME_ZONE })
}
