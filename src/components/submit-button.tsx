"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

// Server actions give no visual feedback on their own: you click, and nothing
// happens until the server responds. With the database in Mumbai and cold
// starts on top, that gap is long enough that people click again or assume the
// site is broken.
//
// useFormStatus reads the pending state of the nearest parent <form>, so this
// has to be a client component rendered *inside* the form (not the component
// that renders the form). While pending it disables itself — which also blocks
// double submits — and swaps in a spinner.
export function SubmitButton({
  children,
  pendingText,
  ...props
}: ComponentProps<typeof Button> & { pendingText?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      {...props}
      type="submit"
      disabled={pending || props.disabled}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {pendingText ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
