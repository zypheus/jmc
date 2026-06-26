import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/login');
    }

    return (
        <GuestLayout>
            <Head title="Staff Login" />

            <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border bg-card shadow-lg md:grid-cols-2">
                <section className="relative overflow-hidden bg-gradient-to-br from-[#1f4ea7] via-[#1f4ea7] to-[#16397c] p-8 text-white">
                    <div className="absolute left-0 top-0 h-full w-2 bg-[#ffd700]" />
                    <div className="relative space-y-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-white/80">Staff Portal</p>
                        <h1 className="text-3xl font-semibold leading-tight">JOSE MARIA COLLEGE</h1>
                        <p className="max-w-sm text-sm text-white/85">
                            Access the integrated attendance and library operations dashboard.
                        </p>
                    </div>
                </section>

                <Card className="rounded-none border-0 shadow-none">
                    <CardHeader>
                        <CardTitle>Staff Login</CardTitle>
                        <CardDescription>Sign in to access your JMC dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    autoComplete="username"
                                    required
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>

                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                Remember me
                            </label>

                            <Button type="submit" className="w-full bg-[#1f4ea7] hover:bg-[#16397c]" disabled={processing}>
                                Sign in
                            </Button>
                        </form>

                        <p className="mt-4 text-center text-sm text-muted-foreground">
                            Patron?{' '}
                            <Link href="/register" className="font-medium text-[#1f4ea7] hover:underline">
                                Register here
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </GuestLayout>
    );
}
