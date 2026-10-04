import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { Bot, Send, User } from "lucide-react";
import { askAssistant } from "@/services/assistantService";

type Message = { role: "assistant" | "user"; text: string };

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: "Bonjour ! Je peux rechercher des écoles et des concours référencés dans Compétences CI. Indique une filière, un diplôme ou une ville." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, loading]);

  const submit = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages(current => [...current, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const reply = await askAssistant(text);
      setMessages(current => [...current, { role: "assistant", text: reply.response }]);
    } catch {
      setMessages(current => [...current, { role: "assistant", text: "Je ne peux pas consulter les données pour le moment. Réessaie dans quelques instants." }]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Layout title="Assistant d’orientation" showBack noBottomNav>
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-2xl flex-col px-4 py-5">
        <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
          <Bot className="mb-2 h-6 w-6 text-primary" />
          Réponses fondées sur les écoles et concours référencés dans Compétences CI.
        </div>
        <div className="flex-1 space-y-3">
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-2 ${message.role === "user" ? "justify-end" : ""}`}>
              {message.role === "assistant" && <Bot className="mt-1 h-4 w-4 shrink-0 text-primary" />}
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${message.role === "user" ? "bg-primary text-white" : "bg-card border border-border/50 text-foreground"}`}>{message.text}</div>
              {message.role === "user" && <User className="mt-1 h-4 w-4 shrink-0 text-primary" />}
            </div>
          ))}
          {loading && <div className="text-xs text-muted-foreground">L’assistant prépare une réponse…</div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="mt-4 flex gap-2">
          <input value={input} maxLength={1200} onChange={event => setInput(event.target.value)} onKeyDown={event => event.key === "Enter" && submit()} placeholder="Ex. Quelle école pour l’informatique ?" className="min-w-0 flex-1 rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-primary" />
          <button onClick={submit} disabled={loading || !input.trim()} className="rounded-xl bg-primary px-4 text-white disabled:opacity-50" aria-label="Envoyer"><Send className="h-4 w-4" /></button>
        </div>
      </div>
    </Layout>
  );
}