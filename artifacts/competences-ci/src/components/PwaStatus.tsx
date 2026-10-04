import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";

export function PwaStatus() {
  const queryClient = useQueryClient();
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const offline = () => { setOnline(false); setSyncing(false); };
    const onlineAgain = async () => {
      setOnline(true);
      setSyncing(true);
      await queryClient.invalidateQueries();
      window.setTimeout(() => setSyncing(false), 1200);
    };
    window.addEventListener("offline", offline);
    window.addEventListener("online", onlineAgain);
    return () => {
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", onlineAgain);
    };
  }, [queryClient]);

  if (online && !syncing) return null;
  return (
    <div role="status" className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold ${online ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}>
      {online ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CloudOff className="h-3.5 w-3.5" />}
      {online ? "Connexion rétablie · actualisation des données" : "Hors connexion · affichage des données déjà consultées"}
      {online && <Cloud className="h-3.5 w-3.5" />}
    </div>
  );
}