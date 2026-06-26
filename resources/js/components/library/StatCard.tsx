import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
    title: string;
    value: number | string;
    icon?: LucideIcon;
    hint?: ReactNode;
}

export default function StatCard({ title, value, icon: Icon, hint }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {Icon && <Icon className="size-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold tracking-tight">{value}</div>
                {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
            </CardContent>
        </Card>
    );
}
