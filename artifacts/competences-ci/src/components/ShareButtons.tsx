import { Facebook, Send } from "lucide-react";

export function ShareButtons({ title, url = window.location.href }: { title: string; url?: string }) {
  const encoded = encodeURIComponent(`${title} — via Compétences CI ${url}`);
  const share = (target: string) => window.open(target, "_blank", "noopener,noreferrer");
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => share(`https://wa.me/?text=${encoded}`)} className="rounded-xl bg-green-600 px-3 py-2 text-xs font-bold text-white">WhatsApp</button>
      <button onClick={() => share(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)} className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white"><Facebook className="h-3.5 w-3.5" /> Facebook</button>
      <button onClick={() => share(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`)} className="inline-flex items-center gap-1 rounded-xl bg-sky-500 px-3 py-2 text-xs font-bold text-white"><Send className="h-3.5 w-3.5" /> Telegram</button>
      {typeof navigator !== "undefined" && navigator.share && (
        <button onClick={() => navigator.share({ title, url }).catch(() => {})} className="rounded-xl bg-muted px-3 py-2 text-xs font-bold text-foreground">Plus</button>
      )}
    </div>
  );
}