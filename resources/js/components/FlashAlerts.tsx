import type { PageProps } from '@/types';

import { Alert, AlertDescription } from '@/components/ui/alert';

interface FlashAlertsProps {
    flash: PageProps['flash'];
}

export default function FlashAlerts({ flash }: FlashAlertsProps) {
    if (!flash.success && !flash.error) {
        return null;
    }

    return (
        <div className="space-y-3">
            {flash.success && (
                <Alert variant="success">
                    <AlertDescription>{flash.success}</AlertDescription>
                </Alert>
            )}
            {flash.error && (
                <Alert variant="destructive">
                    <AlertDescription>{flash.error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
