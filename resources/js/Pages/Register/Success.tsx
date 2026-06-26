import { Head, Link, usePage } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GuestLayout from '@/Layouts/GuestLayout';
import type { PageProps } from '@/types';

export default function Success() {
    const { flash } = usePage<PageProps>().props;

    return (
        <GuestLayout>
            <Head title="Registration Submitted" />

            <div className="mx-auto max-w-lg">
                <Card>
                    <CardHeader>
                        <CardTitle>Registration Submitted</CardTitle>
                        <CardDescription>
                            {flash.success ??
                                'Your registration has been received and is pending admin approval.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <Link href="/register">
                            <Button variant="outline" className="w-full">
                                Register Another Patron
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button className="w-full">Return Home</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </GuestLayout>
    );
}
