import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, FileBarChart2, QrCode, ScanSearch } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps } from '@/types';

const modules = [
    { title: 'Catalog', description: 'Maintain titles and copies.', href: '/books', label: 'Catalog', icon: BookOpen },
    { title: 'RFID scanner', description: 'Verify copy identifiers.', href: '/rfid-scanner', label: 'RFID', icon: QrCode },
    { title: 'E-books', description: 'Digital collection.', href: '/ebooks', label: 'E-books', icon: BookOpen },
    { title: 'OPAC', description: 'Public catalog view.', href: '/opac', label: 'OPAC', icon: ScanSearch, external: true },
    { title: 'Exports', description: 'Books and transactions.', href: '/export-books', label: 'Export books', icon: FileBarChart2 },
    { title: 'Holdings report', description: 'Generate holdings PDF.', href: '/reports/library-holdings', label: 'Holdings', icon: FileBarChart2 },
];

export default function LibraryStaff() {
    const { auth } = usePage<PageProps>().props;
    const firstName = auth.user?.fname;

    return (
        <LibraryLayout>
            <Head title="Library Staff Dashboard" />

            <div className="dashboard-home space-y-6">
                <Card className="dashboard-hero overflow-hidden border-[#E5E7EB] shadow-sm">
                    <div className="h-1.5 bg-[#ffd700]" />
                    <CardContent className="p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#23408E]">
                            Staff dashboard
                        </p>
                        <h1 className="mt-2 text-2xl font-semibold">
                            Welcome back{firstName ? `, ${firstName}` : ''}
                        </h1>
                        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                            Catalog and support tools for library staff. Circulation admin features are
                            not included on this dashboard.
                        </p>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {modules.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Card key={item.href} className="dashboard-module-card border-[#E5E7EB] shadow-sm">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <CardTitle className="text-base">{item.title}</CardTitle>
                                            <CardDescription>{item.description}</CardDescription>
                                        </div>
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#23408E]">
                                            <Icon className="size-5" />
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {item.external ? (
                                        <a href={item.href} target="_blank" rel="noreferrer">
                                            <Button variant="outline" size="sm" className="rounded-[10px]">
                                                {item.label}
                                            </Button>
                                        </a>
                                    ) : (
                                        <Link href={item.href}>
                                            <Button variant="outline" size="sm" className="rounded-[10px]">
                                                {item.label}
                                            </Button>
                                        </Link>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </LibraryLayout>
    );
}
