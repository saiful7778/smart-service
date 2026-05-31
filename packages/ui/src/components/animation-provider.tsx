"use client";

import { AnimatePresence } from "motion/react";

export function AnimationProvider({
  ...props
}: React.ComponentProps<typeof AnimatePresence>) {
  return <AnimatePresence {...props} />;
}
