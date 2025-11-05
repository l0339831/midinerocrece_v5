
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type KPIState = {
  csatCanal: number
  csatInversiones: number
  comentariosCSAT: number
  setKPI: (key: keyof Omit<KPIState, 'setKPI'>, value: number) => void
}

export const useKPIStore = create<KPIState>()(
  persist(
    (set) => ({
      csatCanal: 0,
      csatInversiones: 0,
      comentariosCSAT: 0,
      setKPI: (key, value) => set((s) => ({ ...s, [key]: value })),
    }),
    { name: 'mdc_kpis_v3_5_0' }
  )
)