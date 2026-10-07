import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="currentColor"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
    >
      <circle cx="25" cy="67" r="15" />
      <circle cx="55" cy="37" r="15" />
      <circle cx="105" cy="37" r="15" />
      <circle cx="135" cy="67" r="15" />
      <path
        fillRule="evenodd"
        d="M73 82H87A31 31 0 0 1 87 144H73A31 31 0 0 1 73 82ZM75.5 98H84.5V108.5H95V117.5H84.5V128H75.5V117.5H65V108.5H75.5Z"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[#14203A] dark:text-white",
        className,
      )}
    >
      <LogoMark />
      <span className="text-xl leading-none tracking-tighter">
        <span className="font-light">petty</span>
        <span className="font-semibold">vet</span>
      </span>
      <span className="sr-only">PettyVet</span>
    </span>
  );
}
