import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AttendanceLayout from '@/Layouts/AttendanceLayout';
import type { PageProps } from '@/types';

interface FeedbackProps extends PageProps {
    enabled: boolean;
}

export default function Feedback({ enabled }: FeedbackProps) {
    const { flash } = usePage<PageProps>().props;
    const { data, setData, post, processing } = useForm({
        enabled: enabled ? '1' : '0',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/attendance/logout-feedback');
    }

    return (
        <AttendanceLayout>
            <Head title="Logout Feedback Settings" />

            <div className="mx-auto max-w-lg space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Logout Feedback</h1>
                    <p className="text-muted-foreground">
                        Prompt students for feedback when they scan OUT at the kiosk.
                    </p>
                </div>

                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Scanner Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="enabled">Enable logout feedback on scanner</Label>
                                <select
                                    id="enabled"
                                    className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                                    value={data.enabled}
                                    onChange={(e) => setData('enabled', e.target.value)}
                                >
                                    <option value="1">Enabled</option>
                                    <option value="0">Disabled</option>
                                </select>
                            </div>
                            <Button type="submit" disabled={processing}>
                                Save Settings
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AttendanceLayout>
    );
}
