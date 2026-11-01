"use client";
import { useActionState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { subscribe, type ActionResult } from "@/app/actions";
import { cn } from "@/lib/utils";

export function Newsletter({ dark }: { dark?: boolean }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>((_, fd) => subscribe(fd), null);
  if (state?.ok) {
    return (
      <p className={cn("flex items-center gap-2 text-[15px]", dark ? "text-bg/80" : "text-ink/80")}>
        <Check className="h-4 w-4 text-accent" /> {state.message}
      </p>
    );
  }
  return (
    <form action={action}>
      <div className={cn("flex h-14 items-center rounded-full p-1.5 pl-5", dark ? "bg-bg/[0.08]" : "bg-white hairline")}>
        <input
          name="email"
          type="email"
          required
          placeholder="you@email.com"
          className={cn("min-w-0 flex-1 bg-transparent text-[15px] outline-none", dark ? "placeholder:text-bg/40" : "placeholder:text-ink/40")}
        />
        <button disabled={pending} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-accent-ink transition-transform active:scale-95 disabled:opacity-60" aria-label="Subscribe">
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      {state && !state.ok && <p className="mt-2 text-sm text-coral">{state.error}</p>}
    </form>
  );
}
