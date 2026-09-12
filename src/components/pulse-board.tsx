import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "pulso-mini-state-v1";
const QA_MARKER = "BUILD_NATIVE_QA_01";
/** BUILD_NATIVE_QA_EXPORT_READY_01 — https://dreamapp.grok.me/ */

export type PulseId = "verde" | "amarillo" | "rojo";

type PulseState = {
  selected: PulseId | null;
  count: number;
  lastAt: string | null;
};

const OPTIONS: Array<{
  id: PulseId;
  label: string;
  tone: string;
  selectedClass: string;
  idleClass: string;
  discClass: string;
}> = [
  {
    id: "verde",
    label: "🟢 Verde",
    tone: "Estable",
    selectedClass: "bg-pulse-green text-pulse-green-fg ring-2 ring-pulse-green shadow-[0_0_0_6px_color-mix(in_oklab,var(--color-pulse-green)_22%,transparent)]",
    idleClass: "bg-surface text-fg ring-1 ring-border",
    discClass: "bg-pulse-green",
  },
  {
    id: "amarillo",
    label: "🟡 Amarillo",
    tone: "Atento",
    selectedClass: "bg-pulse-amber text-pulse-amber-fg ring-2 ring-pulse-amber shadow-[0_0_0_6px_color-mix(in_oklab,var(--color-pulse-amber)_22%,transparent)]",
    idleClass: "bg-surface text-fg ring-1 ring-border",
    discClass: "bg-pulse-amber",
  },
  {
    id: "rojo",
    label: "🔴 Rojo",
    tone: "Urgente",
    selectedClass: "bg-pulse-red text-pulse-red-fg ring-2 ring-pulse-red shadow-[0_0_0_6px_color-mix(in_oklab,var(--color-pulse-red)_22%,transparent)]",
    idleClass: "bg-surface text-fg ring-1 ring-border",
    discClass: "bg-pulse-red",
  },
];

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("es-CL", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function readStored(): PulseState {
  if (typeof window === "undefined") {
    return { selected: null, count: 0, lastAt: null };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { selected: null, count: 0, lastAt: null };
    const parsed = JSON.parse(raw) as Partial<PulseState>;
    const selected =
      parsed.selected === "verde" || parsed.selected === "amarillo" || parsed.selected === "rojo"
        ? parsed.selected
        : null;
    const count = typeof parsed.count === "number" && parsed.count >= 0 ? parsed.count : 0;
    const lastAt = typeof parsed.lastAt === "string" ? parsed.lastAt : null;
    return { selected, count, lastAt };
  } catch {
    return { selected: null, count: 0, lastAt: null };
  }
}

export function PulseBoard() {
  const [state, setState] = useState<PulseState>({ selected: null, count: 0, lastAt: null });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readStored());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const choose = useCallback((id: PulseId) => {
    const lastAt = new Date().toISOString();
    setState((prev) => ({
      selected: id,
      count: prev.count + 1,
      lastAt,
    }));
  }, []);

  const selectedOption = useMemo(
    () => OPTIONS.find((option) => option.id === state.selected) ?? null,
    [state.selected],
  );

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-10 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 ring-1 ring-border">
          <Activity className="size-3.5 text-accent" strokeWidth={2.25} aria-hidden="true" />
          <span className="text-xs font-medium tracking-[0.14em] text-muted uppercase">Pulso Mini</span>
        </div>
        <p
          data-testid="qa-marker"
          className="mb-4 inline-flex rounded-md bg-surface-2 px-3 py-1.5 font-mono text-base font-semibold tracking-wide text-fg ring-1 ring-accent"
        >
          {QA_MARKER}
        </p>
        <h1 className="text-[2rem] leading-tight font-semibold tracking-[-0.03em] text-fg">
          Elige tu pulso
        </h1>
        <p className="mt-2 max-w-[28ch] text-pretty text-base leading-normal text-muted">
          Toca un estado. Queda marcado y deja rastro de la interacción.
        </p>
      </header>

      <section aria-label="Estados de pulso" className="flex flex-col gap-3">
        {OPTIONS.map((option) => {
          const selected = state.selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              data-testid={`pulse-${option.id}`}
              data-selected={selected ? "true" : "false"}
              aria-pressed={selected}
              onClick={() => choose(option.id)}
              className={cn(
                "relative flex min-h-20 w-full items-center gap-4 rounded-xl px-5 text-left transition-[transform,background-color,box-shadow,color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
                "active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
                selected ? option.selectedClass : option.idleClass,
              )}
            >
              <span
                className={cn(
                  "size-4 shrink-0 rounded-full",
                  option.discClass,
                  !selected && "ring-2 ring-fg/15",
                )}
                aria-hidden="true"
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-xl font-semibold tracking-[-0.02em]">{option.label}</span>
                <span className={cn("text-sm", selected ? "opacity-80" : "text-subtle")}>
                  {option.tone}
                </span>
              </span>
              {selected ? (
                <span
                  data-testid={`pulse-${option.id}-check`}
                  className="flex size-9 items-center justify-center rounded-full bg-bg/20"
                  aria-hidden="true"
                >
                  <Check className="size-5" strokeWidth={2.5} />
                </span>
              ) : (
                <span className="size-9" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </section>

      <section
        aria-live="polite"
        className="mt-8 rounded-xl bg-surface p-5 ring-1 ring-border"
      >
        <p className="text-xs font-medium tracking-[0.14em] text-subtle uppercase">Estado actual</p>
        <p data-testid="pulse-selected" className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-fg">
          {selectedOption ? selectedOption.label : "Sin pulso"}
        </p>
        <dl className="mt-5 grid grid-cols-1 gap-4">
          <div>
            <dt className="text-xs font-medium tracking-[0.12em] text-subtle uppercase">Interacciones</dt>
            <dd
              data-testid="pulse-count"
              key={state.count}
              className="mt-1 font-mono text-2xl tabular-nums text-fg"
            >
              {state.count}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-[0.12em] text-subtle uppercase">Último pulso</dt>
            <dd
              data-testid="pulse-timestamp"
              className="mt-1 font-mono text-sm leading-relaxed text-muted"
            >
              {state.lastAt ? formatTimestamp(state.lastAt) : "Todavía no hay toques"}
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
