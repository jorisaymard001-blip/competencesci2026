import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useComparison } from "@/contexts/ComparisonContext";
import { getSchoolCost, getDefaultCost, formatCFA } from "@/lib/school-costs";
import { ArrowLeft, ExternalLink, Scale } from "lucide-react";

const rows = [
  { label: "Ville", get: (s: any) => s.city || "—" },
  { label: "Type", get: (s: any) => s.type === "public" ? "Public" : "Privé" },
  { label: "Domaines", get: (s: any) => s.domains?.join(", ") || "—" },
  { label: "Diplômes", get: (s: any) => s.diplomas?.join(", ") || "—" },
  {
    label: "Frais annuels estimés",
    highlight: true,
    get: (s: any) => {
      const cost = getSchoolCost(s.name) ?? getDefaultCost(s.type);
      return `${formatCFA(cost.tuitionMax ?? 0)}/an`;
    },
  },
  {
    label: "Frais d'inscription",
    get: (s: any) => {
      const cost = getSchoolCost(s.name) ?? getDefaultCost(s.type);
      return formatCFA(cost.registrationFee ?? 0);
    },
  },
];

export default function CompareSchools() {
  const { schools, remove, clear } = useComparison();

  return (
    <Layout title="Comparer des écoles" showBack>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-28">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <p className="text-sm text-muted-foreground">Comparez jusqu'à trois établissements</p>
          </div>
          {schools.length > 0 && <button onClick={clear} className="text-sm text-destructive font-semibold">Effacer</button>}
        </div>

        {schools.length < 2 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <Scale className="w-10 h-10 mx-auto mb-3 text-primary/60" />
            <h2 className="font-bold text-lg mb-2">Ajoutez au moins deux écoles</h2>
            <p className="text-sm text-muted-foreground mb-5">Sélectionnez le bouton « Comparer » sur les cartes des écoles.</p>
            <Link href="/schools" className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">Voir les écoles</Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
            <table className="w-full min-w-[680px] border-collapse">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="w-40 p-3 text-left text-xs uppercase tracking-wide text-muted-foreground">Critère</th>
                  {schools.map(school => (
                    <th key={school.id} className="min-w-52 p-4 text-left align-top">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-black text-sm text-foreground">{school.name}</p>
                          <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">{school.type}</span>
                        </div>
                        <button onClick={() => remove(school.id)} aria-label={`Retirer ${school.name}`}><ArrowLeft className="w-4 h-4 rotate-45 text-muted-foreground" /></button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.label} className="border-b border-border/40 last:border-0 even:bg-muted/30">
                    <th className="p-3 text-left text-sm font-bold text-foreground">{row.label}</th>
                    {schools.map(school => (
                      <td key={school.id} className={`p-3 text-sm text-foreground ${row.highlight ? "font-black text-primary" : ""}`}>{row.get(school)}</td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th className="p-3" />
                  {schools.map(school => (
                    <td key={school.id} className="p-3">
                      <Link href={`/schools/${school.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                        Voir la fiche <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}