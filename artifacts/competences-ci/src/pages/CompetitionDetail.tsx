import { useRoute } from "wouter";
import { Layout } from "@/components/Layout";
import { useGetCompetition } from "@workspace/api-client-react";
import { Loader2, Calendar, MapPin, Briefcase, GraduationCap, FileText, CheckCircle2, Globe, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";

export default function CompetitionDetail() {
  const [, params] = useRoute("/competitions/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  
  const { data: comp, isLoading, error } = useGetCompetition(id, {
    query: { enabled: !!id }
  });

  if (isLoading) {
    return (
      <Layout showBack transparentHeader>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="w-10 h-10 animate-spin text-secondary mb-4" />
        </div>
      </Layout>
    );
  }

  if (error || !comp) {
    return <Layout showBack title="Erreur"><div className="p-6 text-center">Concours introuvable.</div></Layout>;
  }

  const statusConfig = {
    open: { label: "Ouvert", color: "text-status-open", bg: "bg-status-open-bg", border: "border-status-open/20" },
    closed: { label: "Fermé", color: "text-status-closed", bg: "bg-status-closed-bg", border: "border-status-closed/20" },
    upcoming: { label: "À venir", color: "text-status-upcoming", bg: "bg-status-upcoming-bg", border: "border-status-upcoming/20" }
  };
  
  const status = statusConfig[comp.status as keyof typeof statusConfig] || statusConfig.closed;

  return (
    <Layout showBack noBottomNav>
      <div className="bg-background min-h-screen">
        
        {/* Header Block */}
        <div className="bg-foreground text-white px-6 pt-8 pb-12 rounded-b-[40px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          
          <div className="relative z-10">
            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border ${status.bg} ${status.color} ${status.border}`}>
              {status.label}
            </div>
            
            <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight mb-4 text-balance">
              {comp.title}
            </h1>
            
            <div className="text-white/80 text-sm font-medium mb-6">
              Ministère : <span className="text-white">{comp.ministry}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
                <Calendar className="w-5 h-5 mb-2 text-secondary" />
                <div className="text-[10px] text-white/60 uppercase font-bold tracking-wider mb-1">Ouverture</div>
                <div className="text-sm font-semibold">{formatDate(comp.openDate)}</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
                <Calendar className="w-5 h-5 mb-2 text-orange-400" />
                <div className="text-[10px] text-white/60 uppercase font-bold tracking-wider mb-1">Clôture</div>
                <div className="text-sm font-semibold">{formatDate(comp.closeDate)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="px-6 -mt-6 relative z-20">
          <div className="bg-card rounded-2xl p-4 shadow-xl shadow-black/5 border border-border/60 flex justify-around">
            <div className="flex flex-col items-center text-center px-2">
              <Briefcase className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-xl font-display font-bold text-foreground">{comp.positions}</span>
              <span className="text-[10px] font-medium uppercase text-muted-foreground">Postes</span>
            </div>
            <div className="w-px bg-border/60" />
            <div className="flex flex-col items-center text-center px-2">
              <GraduationCap className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-sm font-display font-bold text-foreground mt-1 max-w-[100px] truncate">{comp.diploma}</span>
              <span className="text-[10px] font-medium uppercase text-muted-foreground mt-0.5">Niveau</span>
            </div>
            <div className="w-px bg-border/60" />
            <div className="flex flex-col items-center text-center px-2">
              <MapPin className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-sm font-display font-bold text-foreground mt-1">{comp.city}</span>
              <span className="text-[10px] font-medium uppercase text-muted-foreground mt-0.5">Lieu</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 space-y-8">
          
          <section>
            <h2 className="font-display text-lg font-bold mb-3">Description</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {comp.description}
            </p>
          </section>

          {comp.requirements && comp.requirements.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-secondary" /> Conditions requises
              </h2>
              <ul className="space-y-3">
                {comp.requirements.map((req, i) => (
                  <li key={i} className="flex items-start text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 mr-3 text-secondary shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {comp.process && comp.process.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold mb-4">Processus de sélection</h2>
              <div className="relative pl-4 border-l-2 border-muted">
                {comp.process.map((step, i) => (
                  <div key={i} className="mb-6 relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-secondary ring-4 ring-background" />
                    <h3 className="text-sm font-bold text-foreground mb-1">Étape {i + 1}</h3>
                    <p className="text-sm text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(comp.website || comp.contact) && (
            <section className="bg-green-50 border border-green-100 rounded-2xl p-5">
              <h2 className="font-display text-base font-bold mb-3 text-green-900">Plus d'informations</h2>
              <div className="space-y-3">
                {comp.website && (
                  <a href={comp.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-medium text-green-800 hover:text-green-600">
                    <Globe className="w-4 h-4 mr-3" /> Inscription en ligne
                  </a>
                )}
                {comp.contact && (
                  <a href={`tel:${comp.contact}`} className="flex items-center text-sm font-medium text-green-800 hover:text-green-600">
                    <Phone className="w-4 h-4 mr-3" /> Contact: {comp.contact}
                  </a>
                )}
              </div>
            </section>
          )}
          
        </div>
        
        {/* Fixed Apply Button */}
        {comp.status === 'open' && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-xl border-t border-border/50 pb-safe z-40 flex justify-center pointer-events-none">
            <div className="w-full max-w-md pointer-events-auto">
              <button className="w-full py-4 rounded-2xl bg-secondary text-white font-bold shadow-lg shadow-secondary/30 active:scale-[0.98] transition-all">
                S'inscrire au concours
              </button>
            </div>
          </div>
        )}
        {comp.status === 'open' && <div className="h-24" />} {/* Spacer for sticky button */}
        
      </div>
    </Layout>
  );
}
