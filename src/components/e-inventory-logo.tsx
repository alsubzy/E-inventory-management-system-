import { cn } from "@/lib/utils";

export function EInventoryLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("h-10 w-10", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" fillRule="evenodd">
        <circle fill="currentColor" cx="20" cy="20" r="20"></circle>
        <path
          d="M20 27a7 7 0 100-14 7 7 0 000 14z"
          stroke="#FFF"
          strokeWidth="2"
        ></path>
        <path
          d="M20 30a10 10 0 100-20 10 10 0 000 20z"
          stroke="#FFF"
          strokeOpacity=".3"
          strokeWidth="2"
        ></path>
        <path d="M20 13a7 7 0 00-7 7" stroke="#FFF" strokeWidth="2"></path>
      </g>
    </svg>
  );
}
