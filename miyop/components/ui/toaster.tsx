"use client";
import { useToast } from "./use-toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-0 z-[100] flex w-full flex-col items-center space-y-2 p-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "w-full max-w-sm rounded-md border bg-background p-3 shadow",
            toast.variant === "destructive" ? "border-destructive" : ""
          )}
        >
          {toast.title && <div className="font-medium">{toast.title}</div>}
          {toast.description && (
            <div className="text-sm text-muted-foreground">{toast.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}
