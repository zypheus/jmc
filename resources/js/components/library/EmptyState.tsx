import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: ReactNode;
}

export default function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <div className="rounded-full bg-muted p-3 text-muted-foreground">{icon ?? <Inbox className="size-5" />}</div>
                <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                {actionLabel && onAction && (
                    <Button variant="outline" size="sm" onClick={onAction}>
                        {actionLabel}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
