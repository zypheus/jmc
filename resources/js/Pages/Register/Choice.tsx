import { Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Choice() {
    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-semibold">Patron Registration</h1>
                    <p className="mt-2 text-muted-foreground">
                        Choose whether you are registering for attendance, library, or both.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-secondary">Attendance</CardTitle>
                            <CardDescription>Register as a student or employee for attendance tracking.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <Link href="/register/attendance">
                                <Button className="w-full bg-secondary hover:bg-secondary/90">
                                    Student Registration
                                </Button>
                            </Link>
                            <Link href="/register/attendance/employee">
                                <Button variant="outline" className="w-full">
                                    Employee Registration
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-primary">Library</CardTitle>
                            <CardDescription>Register as a student or employee for library services.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <Link href="/register/library">
                                <Button className="w-full">Student Registration</Button>
                            </Link>
                            <Link href="/register/library/employee">
                                <Button variant="outline" className="w-full">
                                    Employee Registration
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </GuestLayout>
    );
}
