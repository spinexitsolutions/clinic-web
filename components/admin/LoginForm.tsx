"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loginAction } from "@/app/admin/actions";
import { Spinner } from "./ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-ink/80">Email</span>
        <input name="email" type="email" required autoComplete="username" defaultValue="admin@solace.clinic" className="field" />
      </label>
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-ink/80">Password</span>
        <div className="relative">
          <input name="password" type={show ? "text" : "password"} required autoComplete="current-password" className="field pr-12" placeholder="••••••••" />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-ink" aria-label="Toggle password">
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </label>
      <AnimatePresence>
        {state?.error && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-sm text-rose-600">
            {state.error}
          </motion.p>
        )}
      </AnimatePresence>
      <button disabled={pending} className="btn btn-primary group h-13 w-full !h-[3.25rem]">
        {pending ? <Spinner /> : <>Sign in <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></>}
      </button>
    </form>
  );
}
