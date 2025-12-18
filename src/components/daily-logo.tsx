import { cn } from "@/lib/utils";

export function DailyLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 115 28"
      className={cn("h-7", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" fillRule="evenodd">
        <g fill="#212121">
          <path d="M14 28a14 14 0 110-28 14 14 0 010 28zm0-3a11 11 0 100-22 11 11 0 000 22z" />
          <path d="M14 14a7 7 0 110-14 7 7 0 010 14zm0-3a4 4 0 100-8 4 4 0 000 8z" />
          <path d="M14 14a7 7 0 00-7 7h3a4 4 0 014-4v-3z" />
        </g>
        <text
          fontFamily="Inter-Bold, Inter"
          fontSize="24"
          fontWeight="bold"
          letterSpacing="2"
        >
          <tspan x="40" y="24">
            DAILY
          </tspan>
        </text>
      </g>
    </svg>
  );
}
