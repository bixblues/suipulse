import { Logo } from "./Logo";

interface LogoWithTextProps {
  className?: string;
}

export function LogoWithText({ className = "" }: LogoWithTextProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo size={32} />
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold tracking-tight">Suipulse</span>
        <span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-lg font-medium text-transparent">
          Hub
        </span>
      </div>
    </div>
  );
}
