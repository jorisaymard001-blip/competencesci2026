import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Search, GraduationCap, Briefcase, ArrowRight, BookOpen, Users, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useListSchools, useListCompetitions } from "@workspace/api-client-react";

export default function Home() {
  const { data: schools } = useListSchools();
  const { data: competitions } = useListCompetitions();
  
  const stats = [
    { label: "Écoles Référencées", value: schools?.length || "40+", icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
    { label: "Concours Ouverts", value: competitions?.filter(c => c.status === 'open').length || "12", icon: Briefcase, color: "text-secondary", bg: "bg-secondary/10" },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative pt-12 pb-8 px-6 overflow-hidden bg-background">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute top-20 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl -translate-x-1/2" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted border border-border text-xs font-semibold text-primary mb-6">
            <span>🇨🇮 Pour l'avenir de la Côte d'Ivoire</span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-[1.1] text-foreground mb-4">
            Trouvez votre <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">voie idéale.</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-[90%] mb-8 text-balance">
            Explorez les meilleures écoles et découvrez les concours de la fonction publique ivoirienne.
          </p>

          {/* Quick Search Mock */}
          <Link href="/schools">
            <div className="flex items-center w-full bg-white rounded-2xl shadow-lg shadow-black/5 border border-border/50 p-2 mb-10">
              <div className="flex-1 flex items-center px-4">
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <span className="text-muted-foreground text-sm">Rechercher une école, un diplôme...</span>
              </div>
              <div className="bg-primary text-white p-3 rounded-xl shadow-md">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      <div className="px-6 pb-24 space-y-8">
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 + (i * 0.1) }}
              className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="font-display text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-xs font-medium text-muted-foreground leading-tight">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Main Navigation Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-xl font-bold">Explorer par section</h2>
          </div>

          <Link href="/schools">
            <motion.div 
              whileHover={{ scale: 0.98 }}
              whileTap={{ scale: 0.96 }}
              className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-white rounded-3xl p-6 border border-orange-100 shadow-sm"
            >
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-1">Annuaire des Écoles</h3>
                  <p className="text-sm text-muted-foreground">Public & Privé en CI</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/competitions">
            <motion.div 
              whileHover={{ scale: 0.98 }}
              whileTap={{ scale: 0.96 }}
              className="relative overflow-hidden bg-gradient-to-br from-green-50 to-white rounded-3xl p-6 border border-green-100 shadow-sm"
            >
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center mb-4">
                    <Briefcase className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-1">Concours Publics</h3>
                  <p className="text-sm text-muted-foreground">Fonction publique & État</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-secondary">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Promo banner */}
        <div className="bg-foreground text-background rounded-3xl p-6 mt-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-3xl" />
          <div className="relative z-10">
            <Users className="w-8 h-8 mb-3 text-primary" />
            <h3 className="font-display font-bold text-lg mb-2">Préparez votre dossier</h3>
            <p className="text-sm text-muted-foreground/80 mb-4 line-clamp-2">
              Assurez-vous d'avoir tous vos documents certifiés avant l'ouverture des concours.
            </p>
            <button className="text-sm font-semibold text-primary flex items-center">
              Voir les conseils <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

      </div>
    </Layout>
  );
}
