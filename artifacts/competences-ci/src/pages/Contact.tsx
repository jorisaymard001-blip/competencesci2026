import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { ChevronRight, Instagram, Facebook } from "lucide-react";
import { useT } from "@/lib/useT";

const CONTACT_EMAIL = "competencesci2004@gmail.com";

export default function Contact() {
  const { t } = useT();

  const links = [
    {
      href: `mailto:${CONTACT_EMAIL}`,
      icon: "✉️",
      iconBg: "bg-primary/10",
      label: t("contact_email_label"),
      sub: CONTACT_EMAIL,
    },
    {
      href: "https://wa.me/message/SIZLNMAWWDNLG1",
      target: "_blank",
      icon: "💬",
      iconBg: "bg-green-500/10",
      label: t("contact_whatsapp_label"),
      sub: t("contact_whatsapp_sub"),
    },
    {
      href: `mailto:${CONTACT_EMAIL}?subject=Bug Report`,
      icon: "🐛",
      iconBg: "bg-red-500/10",
      label: t("contact_bug_label"),
      sub: t("contact_bug_sub"),
    },
  ];

  const socials = [
    {
      href: "https://www.instagram.com/competences_ci?igsh=M3B1dGNqOWU2cnR5&utm_source=qr",
      Icon: Instagram,
      label: t("contact_instagram"),
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
    {
      href: "https://www.facebook.com/profile.php?id=61585422781932&mibextid=wwXIfr",
      Icon: Facebook,
      label: t("contact_facebook"),
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ];

  return (
    <Layout title={t("contact_title")} showBack noBottomNav>
      <div className="px-4 py-5 pb-12">

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted-foreground mb-6 leading-relaxed"
        >
          {t("contact_intro")}
        </motion.p>

        {/* Contact links */}
        <div className="space-y-3 mb-8">
          {links.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              target={link.target ?? undefined}
              rel={link.target ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-4 bg-card border border-border/50 rounded-2xl p-4 shadow-sm active:scale-[0.97] transition-all press"
            >
              <div className={`w-12 h-12 ${link.iconBg} rounded-xl flex items-center justify-center text-2xl shrink-0`}>
                {link.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-foreground">{link.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{link.sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 text-primary" />
            </motion.a>
          ))}
        </div>

        {/* Social networks */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="font-black text-sm text-foreground uppercase tracking-wide mb-3">
            {t("contact_social_title")}
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {socials.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card border border-border/50 rounded-2xl p-4 text-center active:scale-[0.97] transition-all flex flex-col items-center gap-2"
              >
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                  <s.Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="font-black text-sm text-foreground">{s.label}</p>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Créateur */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="bg-card border border-border/50 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-950 border border-orange-800 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-lg">👨‍💻</span>
            </div>
            <div>
              <p className="text-foreground font-bold text-base">Développeur</p>
              <p className="text-muted-foreground text-xs">Conception &amp; Développement</p>
            </div>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Compétences CI a été conçue et développée par Yao Brou Joris Aymard, dans le but de
            faciliter l'orientation académique et professionnelle des étudiants ivoiriens.
          </p>

          <div className="border-t border-border pt-3">
            <p className="text-muted-foreground text-xs">
              © 2026 Compétences CI — Tous droits réservés
            </p>
          </div>
        </motion.div>

      </div>
    </Layout>
  );
}
