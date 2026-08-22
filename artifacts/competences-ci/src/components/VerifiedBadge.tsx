import { BadgeCheck } from "lucide-react";

export function VerifiedBadge({ item }: { item: { isVerified?: number | boolean | null; verificationSource?: string | null } }) {
  if (!item.isVerified) return null;
  return (
    <span
      title={item.verificationSource ? `Vérifié par ${item.verificationSource}` : "Information vérifiée"}
      className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-400"
    >
      <BadgeCheck className="h-3.5 w-3.5" /> Vérifié
    </span>
  );
}