import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AttendanceLayout from '@/Layouts/AttendanceLayout';
import type { PageProps } from '@/types';

interface BlastProps extends PageProps {
    courses: string[];
}

export default function Blast({ courses }: BlastProps) {
    const { flash } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        message: '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        if (confirm('Send this SMS blast to all students with mobile numbers?')) {
            post('/attendance/sms/send');
        }
    }

    return (
        <AttendanceLayout>
            <Head title="SMS Blast" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">SMS Blast</h1>
                    <p className="text-muted-foreground">
                        Send a message to all attendance students with a mobile number. Use{' '}
                        <code className="text-sm">{'{name}'}</code> for personalization.
                    </p>
                </div>

                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}

                {courses.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Available Courses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {courses.join(', ')}
                            </p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Compose Message</CardTitle>
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
                                Send SMS Blast
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AttendanceLayout>
    );
}
