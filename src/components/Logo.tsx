import * as React from "react"
import { cn } from "@/lib/utils"

export const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={cn("w-24 h-24", className)}
      {...props}
    >
      <g>
        <path d="M 10 10 L 30 90 L 50 10 L 70 90 L 90 10" stroke="#b45309" strokeWidth="5" fill="none" />
      </g>
    </svg>
);
