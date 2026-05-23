import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useT } from "@/lib/useT";

const CONTACT_EMAIL = "competencesci2004@gmail.com";
const WHATSAPP_NUMBER = "2250000000000";
const INSTAGRAM_URL = "https://instagram.com/competences_ci";
const FACEBOOK_URL = "https://facebook.com/competencesci";

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
      href: `https://wa.me/${WHATSAPP_NUMBER}`,
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
    { href: INSTAGRAM_URL, icon: "📸", label: t("contact_instagram") },
    { href: FACEBOOK_URL, icon: "👥", label: t("contact_facebook") },
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
              target={link.target}
              rel={link.target ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-4 bg-card border border-border/50 rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-all"
            >
              <div className={`w-12 h-12 ${link.iconBg} rounded-xl flex items-center justify-center text-2xl shrink-0`}>
                {link.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{link.label}</p>
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
          <h2 className="font-display font-bold text-base text-foreground mb-3">
            {t("contact_social_title")}
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {socials.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card border border-border/50 rounded-2xl p-4 text-center active:scale-[0.97] transition-all"
              >
                <p className="text-2xl mb-1.5">{s.icon}</p>
                <p className="font-semibold text-sm text-foreground">{s.label}</p>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Signature */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="bg-card border border-border/50 rounded-2xl p-5 text-center shadow-sm"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xl">🧡</span>
            <p className="font-display font-bold text-primary text-sm">
              {t("about_creator_label")}
            </p>
          </div>
          <p className="text-sm text-foreground font-medium">{t("about_creator")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("contact_made_with")}</p>
        </motion.div>

      </div>
    </Layout>
  );
}
