import { Badge } from '@/components/ui/badge';
import { roleLabel } from '@/lib/authorization';
import { cn } from '@/lib/utils';

export default function RoleBadge({ role, className }: { role: string; className?: string }) {
    return (
        <Badge variant="outline" className={cn('border-current/20 bg-current/10 text-[11px] font-semibold', className)}>
            {roleLabel(role)}
        </Badge>
    );
}
