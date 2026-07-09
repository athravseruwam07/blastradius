"use client";

import { motion } from "framer-motion";
import {
  Boxes,
  ClipboardList,
  GitBranch,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { fadeUp } from "@/lib/motion";

// Icon components (functions) can't cross the Server -> Client Component
// boundary as props — React can only serialize plain data there. The parent
// (app/page.tsx, a Server Component) passes an icon *name*; the lookup
// happens here, entirely on the client side.
const ICONS: Record<string, LucideIcon> = {
  SlidersHorizontal,
  GitBranch,
  Boxes,
  ClipboardList,
};

export default function FeatureCard({
  icon,
  title,
  description,
  index,
}: {
  icon: keyof typeof ICONS;
  title: string;
  description: string;
  index: number;
}) {
  const Icon = ICONS[icon];
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -3 }}
      className="group rounded-xl border border-border bg-surface p-6 transition-colors hover:border-primary/40 hover:bg-surface-hover"
    >
      <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
    </motion.div>
  );
}
