import { Head, router } from '@inertiajs/react';
import { BookOpen, CalendarCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GuestLayout from '@/Layouts/GuestLayout';

type StaffModule = 'attendance' | 'library';

interface SelectModuleProps {
    availableModules: StaffModule[];
}

const moduleDetails = {
    attendance: {
        title: 'Attendance',
        description: 'Open attendance operations, registrations, logs, reports, and settings.',
        icon: CalendarCheck,
    },
    library: {
        title: 'Library',
        description: 'Open catalog, circulation, patrons, reservations, reports, and settings.',
        icon: BookOpen,
    },
} satisfies Record<StaffModule, { title: string; description: string; icon: typeof BookOpen }>;

export default function SelectModule({ availableModules }: SelectModuleProps) {
    function selectModule(module: StaffModule) {
        router.post('/select-module', { module });
    }

    return (
        <GuestLayout>
            <Head title="Select Module" />

            <div className="mx-auto w-full max-w-3xl space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-semibold tracking-tight">Choose your workspace</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Your account can access more than one JMC module.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {availableModules.map((module) => {
                        const details = moduleDetails[module];
                        const Icon = details.icon;

                        return (
                            <Card key={module} className="border-border/70 shadow-sm">
                                <CardHeader>
                                    <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Icon className="size-5" />
                                    </div>
                                    <CardTitle>{details.title}</CardTitle>
                                    <CardDescription>{details.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full" onClick={() => selectModule(module)}>
                                        Open {details.title}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </GuestLayout>
    );
}
