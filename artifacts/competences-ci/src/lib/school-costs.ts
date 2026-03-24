export interface SchoolCostInfo {
  tuitionMin?: number;
  tuitionMax?: number;
  registrationFee?: number;
  otherFees?: string;
  notes?: string;
}

// CFA Franc (XOF) costs per year for each school (by name key)
export const schoolCosts: Record<string, SchoolCostInfo> = {
  // Public schools — generally free or low cost
  "Université Félix Houphouët-Boigny": { tuitionMin: 50000, tuitionMax: 100000, registrationFee: 6000, notes: "Frais de scolarité publics — inscription MESRS obligatoire" },
  "Université Nangui Abrogoua": { tuitionMin: 50000, tuitionMax: 80000, registrationFee: 6000, notes: "Université publique" },
  "Université Péléforo Gon Coulibaly": { tuitionMin: 50000, tuitionMax: 80000, registrationFee: 6000 },
  "Université Jean Lorougnon Guédé": { tuitionMin: 50000, tuitionMax: 80000, registrationFee: 6000 },
  "Université Alassane Ouattara": { tuitionMin: 50000, tuitionMax: 80000, registrationFee: 6000 },
  "Institut National Polytechnique Félix Houphouët-Boigny": { tuitionMin: 100000, tuitionMax: 200000, registrationFee: 25000, notes: "Frais variables selon filière" },
  "Institut National Supérieur des Arts et de l'Action Culturelle": { tuitionMin: 80000, tuitionMax: 150000, registrationFee: 15000 },
  "École Nationale d'Administration": { tuitionMin: 0, tuitionMax: 0, registrationFee: 5000, notes: "Concours d'entrée — formation gratuite pour reçus" },
  "École Nationale de Police": { tuitionMin: 0, tuitionMax: 0, registrationFee: 0, notes: "Formation gratuite sur concours" },
  "École Nationale des Douanes": { tuitionMin: 0, tuitionMax: 0, registrationFee: 0, notes: "Formation gratuite sur concours" },
  "École des Mines et de la Géologie": { tuitionMin: 80000, tuitionMax: 150000, registrationFee: 20000 },
  "Institut des Sciences et Techniques de la Communication": { tuitionMin: 100000, tuitionMax: 180000, registrationFee: 20000 },
  "École Nationale Supérieure de Statistique et d'Économie Appliquée": { tuitionMin: 100000, tuitionMax: 200000, registrationFee: 25000, notes: "Concours d'entrée" },

  // Private schools — generally higher costs
  "Institut National Polytechnique": { tuitionMin: 400000, tuitionMax: 800000, registrationFee: 50000 },
  "Ecole Supérieure de Commerce d'Abidjan": { tuitionMin: 600000, tuitionMax: 1200000, registrationFee: 75000 },
  "Institut Africain de Management": { tuitionMin: 800000, tuitionMax: 1500000, registrationFee: 100000 },
  "Groupe ISTC": { tuitionMin: 500000, tuitionMax: 1000000, registrationFee: 75000 },
  "Ecole Supérieure des Technologies de l'Information et de Communication": { tuitionMin: 700000, tuitionMax: 1200000, registrationFee: 80000 },
  "Ecole Supérieure de Gestion et de Technologie": { tuitionMin: 450000, tuitionMax: 900000, registrationFee: 60000 },
  "Institut des Sciences de Gestion": { tuitionMin: 400000, tuitionMax: 800000, registrationFee: 50000 },
  "Centre Universitaire de Recherche et d'Application en Informatique": { tuitionMin: 600000, tuitionMax: 1000000, registrationFee: 70000 },
  "Institut Supérieur d'Informatique": { tuitionMin: 500000, tuitionMax: 900000, registrationFee: 65000 },
  "Université de l'Atlantique": { tuitionMin: 700000, tuitionMax: 1400000, registrationFee: 100000 },
};

export function getSchoolCost(schoolName: string): SchoolCostInfo | null {
  // Try exact match first
  if (schoolCosts[schoolName]) return schoolCosts[schoolName];
  // Try partial match
  const key = Object.keys(schoolCosts).find(k =>
    schoolName.toLowerCase().includes(k.toLowerCase().split(" ").slice(0, 3).join(" ")) ||
    k.toLowerCase().includes(schoolName.toLowerCase().split(" ").slice(0, 3).join(" "))
  );
  return key ? schoolCosts[key] : null;
}

export function getDefaultCost(type: "public" | "private"): SchoolCostInfo {
  if (type === "public") {
    return { tuitionMin: 50000, tuitionMax: 150000, registrationFee: 6000, notes: "Estimation — frais variables selon filière" };
  }
  return { tuitionMin: 400000, tuitionMax: 1000000, registrationFee: 50000, notes: "Estimation — contacter l'établissement pour le tarif exact" };
}

export function formatCFA(amount: number): string {
  return new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(amount);
}
