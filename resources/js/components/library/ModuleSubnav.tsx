import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface ModuleSubnavItem {
    id: string;
    label: string;
    href: string;
    icon?: ReactNode;
}

interface ModuleSubnavProps {
    value: string;
    items: ModuleSubnavItem[];
}

export default function ModuleSubnav({ value, items }: ModuleSubnavProps) {
    return (
        <Tabs value={value} className="w-full">
            <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-full p-1">
                {items.map((item) => (
                    <TabsTrigger key={item.id} value={item.id} asChild className="rounded-full px-3 py-1.5">
                        <Link href={item.href} className="flex items-center gap-1.5">
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
