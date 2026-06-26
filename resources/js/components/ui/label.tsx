import * as React from 'react';

import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

function Label({ className, ...props }: LabelProps) {
    return (
        <label
            data-slot="label"
            className={cn('text-sm font-medium leading-none select-none', className)}
            {...props}
        />
    );
}

export { Label };
