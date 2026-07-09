/**
 * Deliberately restrained: a faint technical grid and nothing else. Floating
 * blurred gradient blobs were cut — they're the single most recognizable
 * "AI-generated SaaS landing page" cliché, and this product's identity is
 * meant to read as a precise dev tool, not a dreamy marketing site.
 */
export default function AmbientGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-96"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, var(--color-primary) 0%, transparent 100%)",
          opacity: 0.06,
        }}
      />
    </div>
  );
}
