"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteSubscriber } from "@/app/admin/actions";
import { ConfirmButton, useAction } from "./ui";

export function DeleteSubscriber({ id }: { id: string }) {
  const router = useRouter();
  const { run } = useAction();
  return (
    <ConfirmButton className="grid h-9 min-w-9 place-items-center rounded-full px-2 text-xs text-muted transition hover:bg-rose-50 hover:text-rose-600" confirmLabel="Remove?" onConfirm={() => run(() => deleteSubscriber(id), () => router.refresh())}>
      <Trash2 className="size-4" />
    </ConfirmButton>
  );
}
