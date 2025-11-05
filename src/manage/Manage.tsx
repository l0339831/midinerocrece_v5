
import React, { useEffect, useState } from 'react'
import { loadDataset, saveDataset, loadProjects, saveProjects, type Row } from '@/db/storage'
import { parseCSV, toCSV } from '@/utils/csv'

export const ManageView: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([])
  const [projects, setProjects] = useState<string[]>([])

  useEffect(() => {
    (async () => {
      setRows(await loadDataset())
      setProjects(await loadProjects())
    })()
  }, [])

  const onLoadCSV = async (file: File) => {
    const txt = await file.text()
    const parsed = parseCSV(txt)
    setRows(parsed)
    await saveDataset(parsed)
  }

  const onLoadProjects = async (file: File) => {
    const txt = await file.text()
    try {
      const parsed: unknown = JSON.parse(txt)
      const list = Array.isArray(parsed) ? parsed 
        : parsed && typeof parsed === 'object' && 'projects' in parsed && Array.isArray((parsed as {projects: unknown}).projects) 
        ? (parsed as {projects: string[]}).projects 
        : []
      // Validate all entries are strings
      const validList = list.every(item => typeof item === 'string') ? list : []
      setProjects(validList)
      await saveProjects(validList)
    } catch(e: unknown) {
      console.error('Failed to parse projects JSON:', e instanceof Error ? e.message : e)
    }
  }

  const exportAll = () => {
    const csv = toCSV(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'mdc_dataset_export.csv'
    a.click()
  }

  return (
    <div className="card">
      <h3 className="section-title">Gestión de archivos</h3>
      <div className="flex">
        <div>
          <div className="small text-muted">Importar CSAT (.csv)</div>
          <input type="file" accept=".csv" onChange={(e: React.ChangeEvent<HTMLInputElement>)=> e.target.files && onLoadCSV(e.target.files[0])} />
        </div>
        <div>
          <div className="small text-muted">Importar Proyectos (.json)</div>
          <input type="file" accept=".json" onChange={(e: React.ChangeEvent<HTMLInputElement>)=> e.target.files && onLoadProjects(e.target.files[0])} />
        </div>
        <button className="primary" onClick={exportAll}>Exportar dataset CSV</button>
      </div>

      <div className="mt-12 small text-muted">
        Proyectos actuales: {projects.map((p,i)=>(<span key={p + i} className="badge" style={{marginRight:6}}>{p}</span>))}
      </div>
    </div>
  )
}
