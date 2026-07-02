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
    available: 'bg-[var(--status-success-surface)] text-[var(--status-success)] border-[var(--status-success)]/30',
    borrowed: 'bg-[var(--status-danger-surface)] text-[var(--status-danger)] border-[var(--status-danger)]/30',
    reserved: 'bg-[var(--status-warning-surface)] text-[var(--status-warning)] border-[var(--status-warning)]/30',
    in: 'bg-[var(--status-success-surface)] text-[var(--status-success)] border-[var(--status-success)]/30',
    out: 'bg-[var(--status-info-surface)] text-[var(--status-info)] border-[var(--status-info)]/30',
    overdue: 'bg-[var(--status-danger-surface)] text-[var(--status-danger)] border-[var(--status-danger)]/30',
    pending: 'bg-[var(--status-warning-surface)] text-[var(--status-warning)] border-[var(--status-warning)]/30',
    approved: 'bg-[var(--status-success-surface)] text-[var(--status-success)] border-[var(--status-success)]/30',
    rejected: 'bg-muted text-foreground border-border',
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
