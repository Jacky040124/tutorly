import { cn } from "@/lib/utils"

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="relative">
        {/* Outer circle */}
        <div className="w-12 h-12 rounded-full border-4 border-primary/20" />
        {/* Inner spinning circle */}
        <div className="absolute top-0 left-0 w-12 h-12">
          <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>
      </div>
    </div>
  );
}
