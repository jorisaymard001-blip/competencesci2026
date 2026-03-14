import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  title?: string;
  children: ReactNode;
}

export function FilterDrawer({ isOpen, onClose, onApply, onReset, title = "Filtres", children }: FilterDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[70] max-w-md mx-auto w-full bg-background rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh]"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 w-full" onClick={onClose}>
              <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
            </div>
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <h2 className="font-display font-bold text-xl flex items-center">
                <Filter className="w-5 h-5 mr-2 text-primary" />
                {title}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 -mr-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {children}
            </div>
            
            <div className="p-6 pt-4 border-t border-border/50 bg-background flex gap-3 pb-safe">
              <button
                onClick={() => {
                  onReset();
                  onClose();
                }}
                className="flex-1 py-3.5 px-4 rounded-xl font-semibold text-foreground bg-muted hover:bg-muted/80 active:scale-95 transition-all"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => {
                  onApply();
                  onClose();
                }}
                className="flex-[2] py-3.5 px-4 rounded-xl font-semibold text-white bg-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95 transition-all"
              >
                Appliquer
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Helper components for the drawer content
export function FilterSection({ title, children }: { title: string, children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

export function FilterSelect({ 
  value, 
  onChange, 
  options, 
  placeholder 
}: { 
  value: string | undefined, 
  onChange: (val: string | undefined) => void, 
  options: string[], 
  placeholder: string 
}) {
  return (
    <div className="relative">
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        className={cn(
          "w-full appearance-none bg-muted/50 border border-border/80 rounded-xl px-4 py-3.5 text-base outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
          !value ? "text-muted-foreground" : "text-foreground font-medium"
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

export function FilterPills({
  options,
  value,
  onChange
}: {
  options: { value: string, label: string }[],
  value: string | undefined,
  onChange: (val: string | undefined) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(isActive ? undefined : opt.value)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95",
              isActive 
                ? "bg-primary text-white shadow-md shadow-primary/20" 
                : "bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
