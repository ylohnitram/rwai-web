import { LucideProps } from "lucide-react";

export function BlockchainIcon(props: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="7" width="6" height="10" rx="1" />
      <rect x="9" y="3" width="6" height="10" rx="1" />
      <rect x="16" y="7" width="6" height="10" rx="1" />
      <path d="M5 17v2" />
      <path d="M12 13v6" />
      <path d="M19 17v2" />
    </svg>
  );
}
