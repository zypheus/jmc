import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AttendanceLayout from '@/Layouts/AttendanceLayout';
import type { PageProps } from '@/types';

interface ScanMessageProps extends PageProps {
    message: string;
}

export default function ScanMessage({ message }: ScanMessageProps) {
    const { flash } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        message: message ?? '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/attendance/sms/scan-message');
    }

    return (
        <AttendanceLayout>
            <Head title="Scan SMS Template" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Scan SMS Template</h1>
                    <p className="text-muted-foreground">
                        Message sent after each scan. Placeholders:{' '}
                        <code className="text-sm">{'{name}'}</code>,{' '}
                        <code className="text-sm">{'{status}'}</code>,{' '}
                        <code className="text-sm">{'{time}'}</code>.
                    </p>
                </div>

                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Template</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <textarea
                                    id="message"
                                    className="min-h-[120px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    required
                                />
                                {errors.message && (
                                    <p className="text-sm text-destructive">{errors.message}</p>
                                )}
                            </div>
                            <Button type="submit" disabled={processing}>
                                Save Template
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AttendanceLayout>
    );
}
