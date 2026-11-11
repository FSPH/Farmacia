export type DateValue = Date | string | null | undefined

const DATE_PREFIX_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/
const DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?/
const EXPLICIT_TIMEZONE_PATTERN = /(Z|[+-]\d{2}:?\d{2})$/i

function buildLocalDate(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
): Date | null {
  const date = new Date(year, month - 1, day, hour, minute, second, millisecond)

  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
    || date.getHours() !== hour
    || date.getMinutes() !== minute
    || date.getSeconds() !== second
  ) {
    return null
  }

  return date
}

export function parseCalendarDate(value: DateValue): Date | null {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null
    }

    return buildLocalDate(value.getFullYear(), value.getMonth() + 1, value.getDate())
  }

  const normalizedValue = value.trim()
  const dateParts = DATE_PREFIX_PATTERN.exec(normalizedValue)

  if (dateParts) {
    return buildLocalDate(Number(dateParts[1]), Number(dateParts[2]), Number(dateParts[3]))
  }

  const parsedDate = new Date(normalizedValue)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return buildLocalDate(parsedDate.getFullYear(), parsedDate.getMonth() + 1, parsedDate.getDate())
}

export function parseDateTime(value: DateValue): Date | null {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  const normalizedValue = value.trim()
  const dateTimeParts = DATE_TIME_PATTERN.exec(normalizedValue)

  if (dateTimeParts && !EXPLICIT_TIMEZONE_PATTERN.test(normalizedValue)) {
    return buildLocalDate(
      Number(dateTimeParts[1]),
      Number(dateTimeParts[2]),
      Number(dateTimeParts[3]),
      Number(dateTimeParts[4] ?? 0),
      Number(dateTimeParts[5] ?? 0),
      Number(dateTimeParts[6] ?? 0),
      Number((dateTimeParts[7] ?? '').padEnd(3, '0') || 0),
    )
  }

  const parsedDate = new Date(normalizedValue)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

export function formatDateForDisplay(value: DateValue): string {
  const parsedDate = parseCalendarDate(value)
  return parsedDate ? parsedDate.toLocaleDateString('pt-BR') : '-'
}

export function formatDateTimeForDisplay(value: DateValue): string {
  if (typeof value === 'string') {
    const normalizedValue = value.trim()
    const dateTimeParts = DATE_TIME_PATTERN.exec(normalizedValue)

    if (dateTimeParts && !EXPLICIT_TIMEZONE_PATTERN.test(normalizedValue)) {
      const day = dateTimeParts[3]
      const month = dateTimeParts[2]
      const year = dateTimeParts[1]
      const hour = dateTimeParts[4] ?? '00'
      const minute = dateTimeParts[5] ?? '00'
      const second = dateTimeParts[6] ?? '00'
      return `${day}/${month}/${year}, ${hour}:${minute}:${second}`
    }
  }

  const parsedDate = parseDateTime(value)
  return parsedDate
    ? parsedDate.toLocaleString('pt-BR', { timeZone: 'America/Maceio' })
    : '-'
}

export function formatDateForInput(value: DateValue): string {
  const parsedDate = parseCalendarDate(value)

  if (!parsedDate) {
    return ''
  }

  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
  const day = String(parsedDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDateForApi(value: DateValue): string {
  const dateOnly = formatDateForInput(value)
  return dateOnly ? `${dateOnly}T00:00:00` : ''
}
