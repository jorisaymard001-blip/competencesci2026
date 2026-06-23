import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Smartphone, Monitor } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "competences_ci_pwa_dismissed";
const DISMISSED_UNTIL_KEY = "competences_ci_pwa_dismiss_until";

function isRunningStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes("android-app://")
  );
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isRunningStandalone()) return;

    // Don't show if user dismissed recently (7 days)
    const dismissedUntil = localStorage.getItem(DISMISSED_UNTIL_KEY);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil)) return;

    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    if (ios) {
      // iOS doesn't fire beforeinstallprompt — show guide after 3s
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }

    // Listen for beforeinstallprompt (Chrome/Android/Desktop)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after small delay
      setTimeout(() => setShow(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // If app was just installed
    window.addEventListener("appinstalled", () => setShow(false));

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShow(false);
        setDeferredPrompt(null);
      }
    } finally {
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setShowIOSGuide(false);
    // Snooze for 7 days
    localStorage.setItem(DISMISSED_UNTIL_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
  };

  if (!show) return null;

  return (
    <>
      {/* Main install banner */}
      <AnimatePresence>
        {show && !showIOSGuide && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            className="fixed bottom-20 lg:bottom-6 left-0 right-0 z-[60] flex justify-center px-4 pointer-events-none"
          >
            <div className="w-full max-w-md bg-card border border-border/60 rounded-2xl shadow-2xl shadow-black/20 pointer-events-auto overflow-hidden">
              {/* Top accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-primary via-orange-400 to-secondary" />

              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* App icon */}
                  <div className="shrink-0">
                    <img
                      src="/icon-192x192.png"
                      alt="Compétences CI"
                      className="w-14 h-14 rounded-2xl shadow-md border border-border/30"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-display font-bold text-sm text-foreground">Installer l'app</p>
                      <button
                        onClick={handleDismiss}
                        className="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors shrink-0 ml-2"
                        aria-label="Fermer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      Ajoutez <strong>Compétences CI</strong> à votre écran d'accueil pour y accéder en un clic, même hors ligne.
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={handleInstall}
                        disabled={installing}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary text-white text-xs font-bold py-2.5 px-4 rounded-xl active:scale-[0.98] transition-all shadow-md shadow-primary/30 disabled:opacity-70"
                      >
                        {installing ? (
                          <span className="animate-pulse">Installation…</span>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            {isIOS ? "Voir comment" : "Installer"}
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleDismiss}
                        className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-semibold hover:bg-muted/80 transition-colors"
                      >
                        Plus tard
                      </button>
                    </div>
                  </div>
                </div>

                {/* Device icons */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/40">
                  <Smartphone className="w-3 h-3 text-muted-foreground/60" />
                  <Monitor className="w-3 h-3 text-muted-foreground/60" />
                  <span className="text-[10px] text-muted-foreground/60">
                    Disponible sur Android, iPhone et ordinateur
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS installation guide */}
      <AnimatePresence>
        {showIOSGuide && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[70] backdrop-blur-sm"
              onClick={() => setShowIOSGuide(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl shadow-2xl border-t border-border/50 p-6 pb-10"
            >
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />

              <div className="flex items-center gap-3 mb-5">
                <img src="/icon-192x192.png" alt="" className="w-12 h-12 rounded-xl border border-border/30" />
                <div>
                  <h3 className="font-display font-bold text-base">Installer Compétences CI</h3>
                  <p className="text-xs text-muted-foreground">sur votre iPhone / iPad</p>
                </div>
              </div>

              <div className="space-y-4">
                <Step number={1} title='Appuyez sur le bouton "Partager"'>
                  <span className="text-lg">📤</span>
                  <span className="ml-1 text-sm">{"L'icône en bas de votre navigateur Safari"}</span>
                </Step>
                <Step number={2} title={"Ajouter à l'écran d'accueil"}>
                  <span className="text-lg">➕</span>
                  <span className="ml-1 text-sm">
                    {"Faites défiler et appuyez sur « Ajouter à l'écran d'accueil »"}
                  </span>
                </Step>
                <Step number={3} title="Confirmez">
                  <span className="text-sm">
                    {"Appuyez sur « Ajouter » en haut à droite"}
                  </span>
                </Step>
              </div>

              <button
                onClick={() => { setShowIOSGuide(false); handleDismiss(); }}
                className="w-full mt-6 py-3.5 rounded-2xl bg-primary text-white font-bold text-sm active:scale-[0.98] transition-transform"
              >
                Compris !
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
        {number}
      </div>
      <div>
        <p className="font-semibold text-sm mb-0.5">{title}</p>
        <div className="flex items-center gap-0.5 text-muted-foreground text-xs">
          {children}
        </div>
      </div>
    </div>
  );
}
