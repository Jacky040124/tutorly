import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

const spinnerSizes = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16'
};

export function Spinner({ size = 'md', fullPage = false }: SpinnerProps) {
  const Wrapper = fullPage ? 'div' : 'div';
  
  return (
    <Wrapper className={cn(
      "flex items-center justify-center",
      fullPage ? "fixed inset-0 bg-background/80 backdrop-blur-sm" : "min-h-[200px]"
    )}>
      <Loader2 
        className={cn(
          "animate-spin text-primary",
          spinnerSizes[size]
        )} 
      />
    </Wrapper>
  );
} 