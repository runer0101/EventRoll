// Utilitarios para parsing y generación de plantillas Excel
// Cargan ExcelJS dinámicamente para evitar inflar el bundle principal

export async function parseExcelBuffer(arrayBuffer, opts = {}) {
  const { maxRows = 5000, maxFieldLength = 1000 } = opts

  const mod = await import('exceljs')
  const ExcelJS = mod.default || mod
  const workbook = new ExcelJS.Workbook()

  await workbook.xlsx.load(new Uint8Array(arrayBuffer))

  const worksheet = workbook.worksheets[0]
  if (!worksheet) throw new Error('No worksheets found')

  const headerRow = worksheet.getRow(1).values.slice(1).map(v => String(v || '').trim())
  let datosJson = []

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const obj = {}
    headerRow.forEach((h, idx) => {
      const cell = row.getCell(idx + 1).value
      obj[h] = cell != null ? String(cell).trim() : ''
    })
    datosJson.push(obj)
  })

  if (!Array.isArray(datosJson) || datosJson.length === 0) {
    return { rows: [], warnings: ['empty_or_invalid_structure'] }
  }

  if (datosJson.length > maxRows) {
    throw new Error(`Too many rows: ${datosJson.length}`)
  }

  const cleaned = datosJson.slice(0, maxRows).map(row => {
    const out = {}
    for (const [k, v] of Object.entries(row)) {
      const val = typeof v === 'string' ? v.trim() : String(v)
      out[k] = val.length > maxFieldLength ? val.slice(0, maxFieldLength) : val
    }
    return out
  })

  return { rows: cleaned }
}

export async function createTemplateBuffer() {
  const mod = await import('exceljs')
  const ExcelJS = mod.default || mod
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Invitados')

  const headers = ['Nombre', 'Apellido', 'Categoría', 'Estado']
  sheet.addRow(headers)
  sheet.addRow(['Juan', 'Pérez', 'General', 'Pendiente'])
  sheet.addRow(['María', 'García', 'VIP', 'Confirmado'])

  sheet.columns = [
    { width: 20 },
    { width: 20 },
    { width: 15 },
    { width: 15 }
  ]

  const buffer = await workbook.xlsx.writeBuffer()
  return buffer
}
