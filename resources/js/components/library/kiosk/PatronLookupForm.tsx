import { FormEvent, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { ScanLine } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PatronLookupForm() {
    const inputRef = useRef<HTMLInputElement>(null);
    const { data, setData, post, processing, errors } = useForm({
        token: '',
    });

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        function onPageShow() {
            inputRef.current?.focus();
            inputRef.current?.select();
        }

        window.addEventListener('pageshow', onPageShow);

        return () => window.removeEventListener('pageshow', onPageShow);
    }, []);

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/kiosk/lookup');
    }

    return (
        <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="patron-token" className="text-sm font-semibold text-slate-800">
                    ID or QR code
                </Label>
                <div className="relative">
                    <ScanLine className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                        ref={inputRef}
                        id="patron-token"
                        value={data.token}
                        onChange={(event) => setData('token', event.target.value)}
                        className="h-14 border-slate-200 bg-slate-50 pl-12 text-center text-lg font-semibold tracking-wide text-slate-950 placeholder:text-slate-500 focus-visible:border-[var(--jmc-blue)] focus-visible:ring-[var(--jmc-blue)]/25"
                        placeholder="Type or scan here"
                        autoComplete="off"
                        autoFocus
                    />
                </div>
                {errors.token && <p className="text-sm text-destructive">{errors.token}</p>}
            </div>

            <p className="text-center text-sm font-medium text-slate-700">
                Press{' '}
                <kbd className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 shadow-sm">
                    Enter
                </kbd>{' '}
                to open your account
            </p>

            <Button
                type="submit"
                disabled={processing}
                size="lg"
                className="kiosk-btn-gradient h-12 w-full text-base font-semibold text-white transition"
            >
                {processing ? 'Looking up…' : 'Open account'}
            </Button>
        </form>
    );
}
