import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b bg-[#1f4ea7] text-white shadow-sm">
                <div className="mx-auto max-w-6xl px-4 py-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <Link href="/" className="text-xl font-semibold tracking-tight">
                                JOSE MARIA COLLEGE
                            </Link>
                            <p className="text-sm text-white/85">Attendance and Library Management System</p>
                        </div>
                        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
                            <Link href="/opac" className="transition hover:text-[#ffd700]">
                                OPAC
                            </Link>
                            <Link href="/attendance" className="transition hover:text-[#ffd700]">
                                Attendance
                            </Link>
                            <Link href="/register" className="transition hover:text-[#ffd700]">
                                Register
                            </Link>
                            <Link href="/login" className="transition hover:text-[#ffd700]">
                                Login
                            </Link>
                        </nav>
                    </div>
                </div>
                <div className="h-1.5 bg-[#ffd700]" />
            </header>
            <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </div>
    );
}
