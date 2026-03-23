import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export function Container({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1240px] px-4 sm:px-6 md:px-8 lg:px-10",
        className,
      )}
      {...props}
    />
  );
}
