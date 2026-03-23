import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "space-y-4",
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl",
      )}
    >
      <span className="inline-flex items-center rounded-full border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/[0.8]">
        {eyebrow}
      </span>
      <h2
        id={id}
        className="font-display text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl"
      >
        {title}
      </h2>
      <p className="max-w-2xl text-pretty text-base leading-7 text-slate-300/[0.86] sm:text-lg">
        {description}
      </p>
    </div>
  );
}
