import { useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { FileText, Trash2, Upload, Download } from "lucide-react";

interface StoredDocument { id: string; name: string; size: number; type: string; data: string; addedAt: string; }
const KEY = "competences_ci_documents";
function load(): StoredDocument[] { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }

export default function Documents() {
  const [documents, setDocuments] = useState<StoredDocument[]>(load);
  const inputRef = useRef<HTMLInputElement>(null);
  const save = (items: StoredDocument[]) => { setDocuments(items); localStorage.setItem(KEY, JSON.stringify(items)); };
  const addFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 5).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => save([{ id: crypto.randomUUID(), name: file.name, size: file.size, type: file.type, data: String(reader.result), addedAt: new Date().toISOString() }, ...load()]);
      reader.readAsDataURL(file);
    });
  };
  return (
    <Layout title="Mes documents" showBack noBottomNav>
      <div className="mx-auto max-w-2xl px-4 py-6 pb-12">
        <div className="mb-5 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center">
          <Upload className="mx-auto mb-2 h-8 w-8 text-primary" />
          <p className="mb-1 font-bold">Garde tes documents utiles à portée de main</p>
          <p className="mb-4 text-xs text-muted-foreground">Stockage local sur cet appareil. Les fichiers ne sont pas envoyés.</p>
          <button onClick={() => inputRef.current?.click()} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white">Ajouter un document</button>
          <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" onChange={e => addFiles(e.target.files)} />
        </div>
        <div className="space-y-2">
          {documents.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Aucun document enregistré.</p>}
          {documents.map(doc => (
            <div key={doc.id} className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card p-3">
              <FileText className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{doc.name}</p><p className="text-xs text-muted-foreground">{Math.ceil(doc.size / 1024)} Ko</p></div>
              <a href={doc.data} download={doc.name} className="rounded-lg p-2 text-primary" aria-label="Télécharger"><Download className="h-4 w-4" /></a>
              <button onClick={() => save(documents.filter(item => item.id !== doc.id))} className="rounded-lg p-2 text-destructive" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}