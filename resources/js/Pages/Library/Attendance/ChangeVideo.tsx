import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps } from '@/types';

interface ChangeVideoProps extends PageProps {
    currentVideoUrl: string;
    currentVideoPath: string | null;
}

export default function ChangeVideo({ currentVideoUrl, currentVideoPath }: ChangeVideoProps) {
    const { flash } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors, progress, reset } = useForm({
        video: null as File | null,
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/library/attendance/video/upload', {
            forceFormData: true,
            onSuccess: () => reset('video'),
        });
    }

    return (
        <LibraryLayout>
            <Head title="Change Attendance Scanner Video" />

            <div className="mx-auto max-w-3xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Change Attendance Scanner Video</h1>
                    <p className="text-muted-foreground">
                        Upload the MP4 video shown on the public attendance scanner.
                    </p>
                </div>

                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Current Video</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <video key={currentVideoUrl} controls className="max-h-[360px] w-full rounded-lg border bg-black">
                            <source src={currentVideoUrl} type="video/mp4" />
                        </video>
                        <p className="text-sm text-muted-foreground">
                            {currentVideoPath ?? 'Default attendance scanner video'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upload MP4 Video</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="video">MP4 video file</Label>
                                <Input
                                    id="video"
                                    type="file"
                                    accept="video/mp4"
                                    onChange={(event) => setData('video', event.target.files?.[0] ?? null)}
                                    required
                                />
                                <p className="text-sm text-muted-foreground">Maximum upload size: 500 MB.</p>
                                {errors.video && <p className="text-sm text-destructive">{errors.video}</p>}
                                {progress && (
                                    <p className="text-sm text-muted-foreground">
                                        Uploading... {progress.percentage}%
                                    </p>
                                )}
                            </div>
                            <Button type="submit" disabled={processing || !data.video}>
                                {processing ? 'Uploading...' : 'Upload Video'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </LibraryLayout>
    );
}
