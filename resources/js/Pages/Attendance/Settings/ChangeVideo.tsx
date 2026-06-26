import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AttendanceLayout from '@/Layouts/AttendanceLayout';
import type { PageProps } from '@/types';

export default function ChangeVideo(_props: PageProps) {
    const { flash } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors, progress } = useForm({
        video: null as File | null,
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/attendance/upload-video', { forceFormData: true });
    }

    return (
        <AttendanceLayout>
            <Head title="Change Scanner Video" />

            <div className="mx-auto max-w-lg space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Change Scanner Video</h1>
                    <p className="text-muted-foreground">
                        Upload a new MP4 slideshow for the public attendance kiosk.
                    </p>
                </div>

                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Upload Video</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="video">MP4 Video</Label>
                                <Input
                                    id="video"
                                    type="file"
                                    accept="video/mp4"
                                    onChange={(e) => setData('video', e.target.files?.[0] ?? null)}
                                    required
                                />
                                {errors.video && (
                                    <p className="text-sm text-destructive">{errors.video}</p>
                                )}
                                {progress && (
                                    <p className="text-sm text-muted-foreground">
                                        Uploading… {progress.percentage}%
                                    </p>
                                )}
                            </div>
                            <Button type="submit" disabled={processing || !data.video}>
                                Upload Video
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AttendanceLayout>
    );
}
