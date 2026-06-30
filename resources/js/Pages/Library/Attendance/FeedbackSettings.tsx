import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps } from '@/types';

interface FeedbackSettingsProps extends PageProps {
    enabled: boolean;
}

export default function FeedbackSettings({ enabled }: FeedbackSettingsProps) {
    const { flash } = usePage<PageProps>().props;
    const { data, setData, post, processing } = useForm({
        enabled: enabled ? '1' : '0',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/library/attendance/logout-feedback');
    }

    return (
        <LibraryLayout>
            <Head title="Attendance Logout Feedback Settings" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Attendance Logout Feedback</h1>
                    <p className="text-muted-foreground">
                        Control whether students see the feedback prompt after scanning OUT.
                    </p>
                </div>

                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Scanner Feedback Setting</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="enabled">Logout feedback prompt</Label>
                                <select
                                    id="enabled"
                                    className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                                    value={data.enabled}
                                    onChange={(event) => setData('enabled', event.target.value)}
                                >
                                    <option value="1">Enabled</option>
                                    <option value="0">Disabled</option>
                                </select>
                            </div>

                            <div className="rounded-lg border bg-muted/40 p-4">
                                <p className="mb-3 text-sm font-medium">Rating options shown on the scanner</p>
                                <div className="grid gap-2 sm:grid-cols-5">
                                    {['Excellent', 'Good', 'Medium', 'Poor', 'Very Bad'].map((label) => (
                                        <div key={label} className="rounded-md border bg-background px-3 py-2 text-center text-sm">
                                            {label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button type="submit" disabled={processing}>
                                Save Setting
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </LibraryLayout>
    );
}
