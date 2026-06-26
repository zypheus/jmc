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
        <Card className={cn('sticky top-[86px] rounded-2xl border-[#E5E7EB] shadow-sm', className)}>
            <CardHeader className="border-b border-[#E5E7EB] pb-3">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">{children}</CardContent>
        </Card>
    );
}
