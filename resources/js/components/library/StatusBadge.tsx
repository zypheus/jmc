import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusTone =
    | 'available'
    | 'borrowed'
    | 'reserved'
    | 'in'
    | 'out'
    | 'overdue'
    | 'pending'
    | 'approved'
    | 'rejected';

const statusClasses: Record<StatusTone, string> = {
    available: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    borrowed: 'bg-red-100 text-red-800 border-red-200',
    reserved: 'bg-amber-100 text-amber-900 border-amber-200',
    in: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    out: 'bg-blue-100 text-blue-800 border-blue-200',
    overdue: 'bg-rose-100 text-rose-800 border-rose-200',
    pending: 'bg-orange-100 text-orange-800 border-orange-200',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-slate-200 text-slate-800 border-slate-300',
};

interface StatusBadgeProps {
    tone: StatusTone;
    children: string;
    className?: string;
}

export default function StatusBadge({ tone, children, className }: StatusBadgeProps) {
    return (
        <Badge variant="outline" className={cn('border text-xs font-semibold uppercase tracking-wide', statusClasses[tone], className)}>
            {children}
        </Badge>
    );
}
