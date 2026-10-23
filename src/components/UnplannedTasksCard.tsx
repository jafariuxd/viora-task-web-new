import { CheckCircle2, ChevronRight } from 'lucide-react';

interface UnplannedTasksCardProps {
  count: number;
  onClick?: () => void;
}

export function UnplannedTasksCard({ count, onClick }: UnplannedTasksCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-viora-unplanned rounded-[28px] p-5 flex flex-col justify-between h-[80px] sm:h-[138px] select-none cursor-pointer transition-all hover:opacity-95 active:scale-[0.99] group shadow-sm"
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-black" />
        </div>
        <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all">
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-black text-[16px] font-bold tracking-tight">
            Completed Tasks
          </span>
          <span className="text-[11px] text-black/60 font-medium">
            Finished tasks
          </span>
        </div>

        <span className="text-black text-[28px] sm:text-[32px] font-bold leading-none">
          {count}
        </span>
      </div>
    </div>
  );
}
