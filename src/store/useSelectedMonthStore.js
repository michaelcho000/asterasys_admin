import { create } from 'zustand'

export const useSelectedMonthStore = create((set) => ({
  selectedMonth: null,
  availableMonths: [],
  loading: true,
  setSelectedMonth: (month) => set({ selectedMonth: month }),
  setAvailableMonths: (months) => set({ availableMonths: months }),
  setLoading: (loading) => set({ loading })
}))
