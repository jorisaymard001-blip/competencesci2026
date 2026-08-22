import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Bot, Send, User } from "lucide-react";

type Message = { role: "assistant" | "user"; text: string };

function answer(question: string) {
  const q = question.toLowerCase();
  if (q.includes("concours") || q.includes("inscription")) return "Tu peux consulter les concours ouverts dans la rubrique Concours. Ouvre une fiche pour voir les conditions, les dates limites et le site officiel.";
  if (q.includes("budget") || q.includes("prix") || q.includes("frais")) return "Le comparateur d’écoles affiche les frais annuels et d’inscription estimés. Pense à confirmer les montants auprès de l’établissement avant ton inscription.";
  if (q.includes("informatique") || q.includes("numérique")) return "Pour l’informatique, utilise l’orientation et sélectionne Informatique / Numérique ainsi que les matières qui te correspondent.";
  if (q.includes("document") || q.includes("dossier")) return "Tu peux conserver tes pièces dans Mes documents. Elles restent stockées localement sur ton appareil et ne sont pas envoyées.";
  return "Je peux t’aider à trouver une école, comprendre un concours, estimer un budget ou préparer ton dossier. Pose-moi une question plus précise.";
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: "Bonjour ! Je suis ton assistant Compétences CI. Que recherches-tu ?" }]);
  const [input, setInput] = useState("");
  const submit = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(current => [...current, { role: "user", text }, { role: "assistant", text: answer(text) }]);
    setInput("");
  };
  return (
    <Layout title="Assistant d’orientation" showBack noBottomNav>
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-2xl flex-col px-4 py-5">
        <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
          <Bot className="mb-2 h-6 w-6 text-primary" />
          Assistant hors ligne : tes messages restent sur cet appareil.
        </div>
        <div className="flex-1 space-y-3">
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-2 ${message.role === "user" ? "justify-end" : ""}`}>
              {message.role === "assistant" && <Bot className="mt-1 h-4 w-4 shrink-0 text-primary" />}
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${message.role === "user" ? "bg-primary text-white" : "bg-card border border-border/50 text-foreground"}`}>{message.text}</div>
              {message.role === "user" && <User className="mt-1 h-4 w-4 shrink-0 text-primary" />}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => event.key === "Enter" && submit()} placeholder="Ex. Quelle école pour l’informatique ?" className="min-w-0 flex-1 rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-primary" />
          <button onClick={submit} className="rounded-xl bg-primary px-4 text-white" aria-label="Envoyer"><Send className="h-4 w-4" /></button>
        </div>
      </div>
    </Layout>
  );
}