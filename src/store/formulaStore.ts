import { create } from 'zustand';

interface FormulaState {
  formula: string;
  setFormula: (formula: string) => void;
}

export const useFormulaStore = create<FormulaState>((set) => ({
  formula: '',
  setFormula: (formula) => set({ formula }),
}));