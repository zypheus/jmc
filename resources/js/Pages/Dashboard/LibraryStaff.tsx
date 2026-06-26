import { Head } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LibraryLayout from '@/Layouts/LibraryLayout';

const modules = [
    { title: 'Catalog', description: 'Maintain titles and copies.', href: '/books', label: 'Catalog' },
    { title: 'RFID scanner', description: 'Verify copy identifiers.', href: '/rfid-scanner', label: 'RFID' },
    { title: 'E-books', description: 'Digital collection.', href: '/ebooks', label: 'E-books' },
    { title: 'OPAC', description: 'Public catalog view.', href: '/opac', label: 'OPAC', external: true },
    { title: 'Exports', description: 'Books and transactions.', href: '/export-books', label: 'Export books' },
    { title: 'Holdings report', description: 'Generate holdings PDF.', href: '/reports/library-holdings', label: 'Holdings' },
];

export default function LibraryStaff() {
    return (
        <LibraryLayout>
            <Head title="Library Staff Dashboard" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Library Staff Dashboard</h1>
                    <p className="text-muted-foreground">Catalog and support tools (no circulation admin).</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {modules.map((item) => (
                        <Card key={item.href}>
                            <CardHeader>
                                <CardTitle className="text-base">{item.title}</CardTitle>
                                <CardDescription>{item.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <a href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined}>
                                    <Button variant="outline" size="sm">{item.label}</Button>
                                </a>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </LibraryLayout>
    );
}
