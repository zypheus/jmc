import { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FilterSidebarCardProps {
    title: string;
    children: ReactNode;
    className?: string;
}

export default function FilterSidebarCard({ title, children, className }: FilterSidebarCardProps) {
    return (
        <Card className={cn('sticky top-6', className)}>
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">{children}</CardContent>
        </Card>
    );
}
