import { router } from '@inertiajs/react';
import { BookOpen, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CatalogWelcomePanel() {
    return (
        <Card className="dashboard-welcome border-dashed border-[#E5E7EB] bg-white py-10 shadow-sm">
            <CardContent className="flex flex-col items-center px-6 text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#23408E]/10 text-[#23408E]">
                    <Search className="size-7" />
                </div>
                <h2 className="text-lg font-semibold">Search or filter to view the catalog</h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Use the panel on the left to search by title or author, filter by program or
                    publication year, or choose Available / Borrowed to load results here.
                </p>
                <Button
                    className="mt-6 rounded-[10px]"
                    size="lg"
                    variant="secondary"
                    onClick={() => router.get('/books', { show_all: 1 }, { preserveState: true })}
                >
                    <BookOpen className="mr-2 size-4" />
                    Show all books
                </Button>
            </CardContent>
        </Card>
    );
}
