import { ref } from 'vue'

export function useExcelOperations({
  permisos,
  invitados,
  modoBackend,
  eventoIdActual,
  registrarActividad,
  toast,
  loading,
  cargarDatos,
}) {
  const { success, error, warning } = toast
  const { show: showLoading, hide: hideLoading, updateProgress } = loading

  const inputArchivo = ref(null)

  async function exportarCSV() {
    if (!permisos.value.exportarExcel) {
      error('No tienes permiso para exportar', 'Acceso Denegado')
      return
    }

    if (invitados.value.length === 0) {
      warning('No hay invitados para exportar', 'Lista Vacía')
      return
    }

    try {
      showLoading({ message: 'Exportando a CSV...', progress: 0 })

      const headers = ['Nombre', 'Apellido', 'Categoría', 'Estado']

      updateProgress(30, 'Procesando datos...')

      const rows = invitados.value.map(inv => [
        inv.nombre,
        inv.apellido,
        inv.categoria,
        inv.confirmado ? 'Confirmado' : 'Pendiente'
      ])

      updateProgress(60, 'Generando archivo...')
      await new Promise(resolve => setTimeout(resolve, 300))

      const csvEscape = (val) => {
        const str = val == null ? '' : String(val)
        return /[,"\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
      }

      const csvContent = [
        headers.map(csvEscape).join(','),
        ...rows.map(row => row.map(csvEscape).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      updateProgress(90, 'Descargando archivo...')

      const fecha = new Date().toISOString().split('T')[0]
      link.setAttribute('href', url)
      link.setAttribute('download', `Invitados_${fecha}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      updateProgress(100, 'Completado')
      await new Promise(resolve => setTimeout(resolve, 300))

      registrarActividad(`Exportó ${invitados.value.length} invitados a CSV`)
      success(`Se exportaron ${invitados.value.length} invitados a CSV`, 'Exportación Exitosa', 4000)
    } catch {
      error('Ocurrió un error al exportar el archivo CSV', 'Error de Exportación')
    } finally {
      hideLoading()
    }
  }

  async function exportarExcel() {
    if (!permisos.value.exportarExcel) {
      error('No tienes permiso para exportar a Excel', 'Acceso Denegado')
      return
    }

    if (invitados.value.length === 0) {
      warning('No hay invitados para exportar', 'Lista Vacía')
      return
    }

    try {
      showLoading({ message: 'Exportando a Excel...', progress: 0 })

      const datosExcel = invitados.value.map(inv => ({
        'Nombre': inv.nombre,
        'Apellido': inv.apellido,
        'Categoría': inv.categoria,
        'Estado': inv.confirmado ? 'Confirmado' : 'Pendiente'
      }))

      updateProgress(30, 'Procesando datos...')
      await new Promise(resolve => setTimeout(resolve, 300))

      const mod = await import('exceljs')
      const ExcelJS = mod.default || mod
      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet('Invitados')

      const headers = ['Nombre', 'Apellido', 'Categoría', 'Estado']
      sheet.addRow(headers)

      for (const r of datosExcel) {
        sheet.addRow([r.Nombre, r.Apellido, r['Categoría'], r.Estado])
      }

      sheet.columns = [
        { width: 20 },
        { width: 20 },
        { width: 15 },
        { width: 15 }
      ]

      updateProgress(80, 'Creando archivo...')
      await new Promise(resolve => setTimeout(resolve, 400))

      const fecha = new Date().toISOString().split('T')[0]
      const nombreArchivo = `Invitados_${fecha}.xlsx`

      updateProgress(95, 'Descargando...')

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nombreArchivo
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      updateProgress(100, 'Completado')
      await new Promise(resolve => setTimeout(resolve, 300))

      registrarActividad(`Exportó ${invitados.value.length} invitados a Excel`)
      success(`Se exportaron ${invitados.value.length} invitados a Excel`, 'Exportación Exitosa', 4000)
    } catch {
      error('Ocurrió un error al exportar el archivo Excel', 'Error de Exportación')
    } finally {
      hideLoading()
    }
  }

  async function importarExcel(evento) {
    if (!permisos.value.importarExcel) {
      error('No tienes permiso para importar desde Excel', 'Acceso Denegado')
      evento.target.value = ''
      return
    }

    const archivo = evento.target.files[0]

    if (!archivo) return

    const MAX_FILE_SIZE = 5 * 1024 * 1024
    const ALLOWED_EXT = /\.(xlsx|xls|csv)$/i
    const MAX_ROWS = 5000

    if (archivo.size > MAX_FILE_SIZE) {
      error('El archivo es demasiado grande. El límite es 5 MB.', 'Archivo Inválido')
      evento.target.value = ''
      return
    }

    if (!ALLOWED_EXT.test(archivo.name) && !(archivo.type && /spreadsheet|excel|csv|octet-stream/i.test(archivo.type))) {
      error('Tipo de archivo no soportado. Usa .xlsx, .xls o .csv', 'Archivo Inválido')
      evento.target.value = ''
      return
    }

    showLoading({ message: `Cargando archivo ${archivo.name}...`, progress: 0 })

    const lector = new FileReader()

    lector.onload = async (e) => {
      try {
        updateProgress(20, 'Leyendo archivo Excel...')

        const { parseExcelBuffer } = await import('@/utils/excelImporter.js')
        let parsed
        try {
          parsed = await parseExcelBuffer(e.target.result, { maxRows: MAX_ROWS, maxFieldLength: 1000 })
        } catch (parseErr) {
          hideLoading()

          if (String(parseErr.message).includes('Too many rows')) {
            error(`El archivo contiene demasiadas filas. Límite: ${MAX_ROWS}`, 'Archivo Demasiado Grande')
          } else {
            error('El archivo no parece ser un Excel válido o está corrupto.', 'Archivo Inválido')
          }
          evento.target.value = ''
          return
        }

        if (!parsed || !Array.isArray(parsed.rows) || parsed.rows.length === 0) {
          hideLoading()
          error('El archivo Excel está vacío o no tiene la estructura correcta. Asegúrate de que tenga encabezados y datos.', 'Archivo Inválido', 6000)
          evento.target.value = ''
          return
        }

        updateProgress(40, 'Procesando datos...')
        await new Promise(resolve => setTimeout(resolve, 200))

        let datosJson = parsed.rows

        if (!Array.isArray(datosJson) || datosJson.length === 0) {
          hideLoading()
          error('El archivo Excel está vacío o no tiene la estructura correcta. Asegúrate de que tenga encabezados y datos.', 'Archivo Inválido', 6000)
          evento.target.value = ''
          return
        }

        if (datosJson.length > MAX_ROWS) {
          hideLoading()
          error(`El archivo contiene demasiadas filas (${datosJson.length}). Límite: ${MAX_ROWS}`, 'Archivo Demasiado Grande')
          evento.target.value = ''
          return
        }

        datosJson = datosJson.slice(0, MAX_ROWS).map(row => {
          const cleaned = {}
          for (const [k, v] of Object.entries(row)) {
            const val = typeof v === 'string' ? v.trim() : String(v)
            cleaned[k] = val.length > 1000 ? val.slice(0, 1000) : val
          }
          return cleaned
        })

        updateProgress(60, `Importando ${datosJson.length} filas...`)

        if (modoBackend.value) {
          try {
            const invitadosParaImportar = datosJson.map(fila => {
              const buscarColumna = (variaciones) => {
                for (let variacion of variaciones) {
                  if (fila[variacion] !== undefined && fila[variacion] !== null && fila[variacion] !== '') {
                    return String(fila[variacion]).trim()
                  }
                }
                return ''
              }

              const nombre = buscarColumna([
                'Nombre', 'nombre', 'NOMBRE', 'Nombres', 'nombres', 'NOMBRES',
                'Name', 'name', 'NAME', 'First Name', 'first name', 'FIRST NAME',
                'FirstName', 'firstname', 'FIRSTNAME'
              ])

              const apellido = buscarColumna([
                'Apellido', 'apellido', 'APELLIDO', 'Apellidos', 'apellidos', 'APELLIDOS',
                'Last Name', 'last name', 'LAST NAME', 'LastName', 'lastname', 'LASTNAME',
                'Surname', 'surname', 'SURNAME'
              ])

              const categoria = buscarColumna([
                'Categoría', 'categoria', 'CATEGORIA', 'Categoria', 'CATEGORÍA',
                'Category', 'category', 'CATEGORY', 'Tipo', 'tipo', 'TIPO',
                'Type', 'type', 'TYPE'
              ]) || 'General'

              const estado = buscarColumna([
                'Estado', 'estado', 'ESTADO', 'Status', 'status', 'STATUS',
                'Confirmación', 'confirmacion', 'CONFIRMACION',
                'Confirmado', 'confirmado', 'CONFIRMADO',
                'Confirmed', 'confirmed', 'CONFIRMED'
              ]) || 'Pendiente'

              const categoriasValidas = ['General', 'VIP', 'Familia', 'Amigos', 'Trabajo']
              const categoriaFinal = categoriasValidas.includes(categoria) ? categoria : 'General'

              return {
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                categoria: categoriaFinal,
                confirmado: estado.toLowerCase().includes('confirmado')
              }
            }).filter(inv => inv.nombre !== '')

            updateProgress(75, `Enviando ${invitadosParaImportar.length} invitados al servidor...`)

            const { invitadosAPI } = await import('../services/api')

            const response = await invitadosAPI.import(invitadosParaImportar, eventoIdActual.value)

            if (response.success && response.data) {
              const { importados: imp, duplicados, errores } = response.data

              updateProgress(90, 'Recargando lista...')
              await cargarDatos()

              updateProgress(100, 'Completado')
              await new Promise(resolve => setTimeout(resolve, 300))

              hideLoading()

              if (imp > 0 && errores.length === 0) {
                success(`Se importaron ${imp} invitados correctamente`, 'Importación Exitosa', 5000)
              } else if (imp > 0 && errores.length > 0) {
                warning(`Se importaron ${imp} invitados. ${duplicados} duplicados omitidos.`, 'Importación con Advertencias', 6000)
              } else {
                error(`No se importó ningún invitado. ${duplicados} duplicados.`, 'Importación Fallida', 6000)
              }

              registrarActividad(`Importó ${imp} invitados desde Excel (${duplicados} duplicados)`)
              evento.target.value = ''
              return
            }
          } catch {
            warning('Error al importar con backend, usando modo local', 'Modo Local', 4000)
            modoBackend.value = false
          }
        }

        let importados = 0
        let duplicados = 0
        let filasInvalidas = 0
        const erroresPorFila = []

        datosJson.forEach((fila, index) => {
          const buscarColumna = (variaciones) => {
            for (let variacion of variaciones) {
              if (fila[variacion] !== undefined && fila[variacion] !== null && fila[variacion] !== '') {
                return String(fila[variacion]).trim()
              }
            }
            return ''
          }

          const nombre = buscarColumna([
            'Nombre', 'nombre', 'NOMBRE',
            'Nombres', 'nombres', 'NOMBRES',
            'Name', 'name', 'NAME',
            'First Name', 'first name', 'FIRST NAME',
            'FirstName', 'firstname', 'FIRSTNAME'
          ])

          const apellido = buscarColumna([
            'Apellido', 'apellido', 'APELLIDO',
            'Apellidos', 'apellidos', 'APELLIDOS',
            'Last Name', 'last name', 'LAST NAME',
            'LastName', 'lastname', 'LASTNAME',
            'Surname', 'surname', 'SURNAME'
          ])

          const categoria = buscarColumna([
            'Categoría', 'categoria', 'CATEGORIA',
            'Categoria', 'CATEGORÍA',
            'Category', 'category', 'CATEGORY',
            'Tipo', 'tipo', 'TIPO',
            'Type', 'type', 'TYPE'
          ]) || 'General'

          const estado = buscarColumna([
            'Estado', 'estado', 'ESTADO',
            'Status', 'status', 'STATUS',
            'Confirmación', 'confirmacion', 'CONFIRMACION',
            'Confirmado', 'confirmado', 'CONFIRMADO',
            'Confirmed', 'confirmed', 'CONFIRMED'
          ]) || 'Pendiente'

          if (!nombre.trim()) {
            filasInvalidas++
            erroresPorFila.push(`Fila ${index + 2}: Falta el nombre`)
            return
          }

          const existe = invitados.value.some(inv =>
            inv.nombre.toLowerCase() === nombre.toLowerCase() &&
            inv.apellido.toLowerCase() === apellido.toLowerCase()
          )

          if (existe) {
            duplicados++
            erroresPorFila.push(`Fila ${index + 2}: "${nombre} ${apellido}" ya existe`)
            return
          }

          const categoriasValidas = ['General', 'VIP', 'Familia', 'Amigos', 'Trabajo']
          const categoriaFinal = categoriasValidas.includes(categoria) ? categoria : 'General'

          invitados.value.push({
            id: Date.now() + importados,
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            categoria: categoriaFinal,
            confirmado: estado.toLowerCase().includes('confirmado')
          })

          importados++
        })

        updateProgress(90, 'Finalizando importación...')
        await new Promise(resolve => setTimeout(resolve, 300))

        updateProgress(100, 'Completado')
        await new Promise(resolve => setTimeout(resolve, 300))

        registrarActividad(`Importó ${importados} invitados desde Excel (${duplicados} duplicados, ${filasInvalidas} inválidos)`)

        hideLoading()

        if (importados > 0 && erroresPorFila.length === 0) {
          success(`Se importaron ${importados} invitados correctamente`, 'Importación Exitosa', 5000)
        } else if (importados > 0 && erroresPorFila.length > 0) {
          warning(`Se importaron ${importados} invitados. ${duplicados} duplicados y ${filasInvalidas} inválidos omitidos.`, 'Importación con Advertencias', 6000)
        } else {
          error(`No se importó ningún invitado. ${duplicados} duplicados y ${filasInvalidas} inválidos.`, 'Importación Fallida', 6000)
        }

      } catch (err) {
        hideLoading()

        let mensajeError = ''

        if (err.message.includes('Unsupported file')) {
          mensajeError = 'El archivo no es un formato Excel válido. Formatos aceptados: .xlsx, .xls'
        } else if (err.message.includes('Cannot read')) {
          mensajeError = 'No se pudo leer el archivo. Puede estar corrupto, protegido con contraseña o abierto en otro programa.'
        } else {
          mensajeError = `Error inesperado: ${err.message}`
        }

        error(mensajeError, 'Error al Procesar Archivo', 6000)

      }

      evento.target.value = ''
    }

    lector.readAsArrayBuffer(archivo)
  }

  function abrirSelectorArchivo() {
    inputArchivo.value.click()
  }

  async function descargarPlantilla() {
    try {
      const { createTemplateBuffer } = await import('@/utils/excelImporter.js')
      const buffer = await createTemplateBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Plantilla_Invitados.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      success('Plantilla descargada. Editala y luego importa el archivo.', 'Plantilla lista')
    } catch {
      error('Error generando la plantilla. Intenta nuevamente.', 'Error')
    }
  }

  return {
    inputArchivo,
    exportarCSV,
    exportarExcel,
    importarExcel,
    abrirSelectorArchivo,
    descargarPlantilla,
  }
}
