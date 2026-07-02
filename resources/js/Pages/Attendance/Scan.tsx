import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useScannerInput } from '@/hooks/use-scanner-input';

interface ScanProps {
    logoutFeedbackEnabled: boolean;
    sectionPickerEnabled: boolean;
    attendanceSections: string[];
    attendanceVideoUrl: string;
    scanEndpoint?: string;
    sectionEndpoint?: string;
    feedbackEndpoint?: string | null;
    scannerTheme?: 'attendance' | 'library';
}

interface PatronInfo {
    id: number;
    firstname: string;
    lastname: string;
    profile_picture: string | null;
}

interface DisplayState {
    kind: 'idle' | 'patron' | 'book' | 'error';
    firstname?: string;
    lastname?: string;
    status?: string;
    timestamp?: string;
    section?: string;
    message?: string;
    profilePicture?: string | null;
    bookTitle?: string;
    bookStatus?: string;
    copyIdentifier?: string;
}

function csrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

function profileUrl(path: string | null | undefined): string {
    return path ? `/${path.replace(/^\//, '')}` : '/images/2x2_undifined_gender.jpg';
}

export default function Scan({
    logoutFeedbackEnabled,
    sectionPickerEnabled,
    attendanceSections,
    attendanceVideoUrl,
    scanEndpoint = '/attendance',
    sectionEndpoint = '/attendance/section',
    feedbackEndpoint = null,
    scannerTheme = 'attendance',
}: ScanProps) {
    const [display, setDisplay] = useState<DisplayState>({ kind: 'idle' });
    const [profileSrc, setProfileSrc] = useState('/images/2x2_undifined_gender.jpg');
    const [now, setNow] = useState(new Date());
    const [sectionModalOpen, setSectionModalOpen] = useState(false);
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [pendingPatron, setPendingPatron] = useState<PatronInfo | null>(null);
    const [pendingPatronType, setPendingPatronType] = useState<'student' | 'employee'>('student');
    const [currentStudentId, setCurrentStudentId] = useState<number | null>(null);
    const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cooldownRef = useRef(false);

    const hasSections = attendanceSections.length > 0;
    const theme = scannerTheme === 'library'
        ? {
            page: 'bg-[var(--jmc-page)] text-[var(--jmc-ink)]',
            header: 'border-b border-[var(--jmc-navy)] bg-[var(--jmc-blue)] px-6 py-4 text-white',
            eyebrow: 'text-sm font-medium text-white/85',
            sidebar: 'flex w-full flex-col items-center gap-4 bg-[var(--jmc-navy)] p-6 text-white lg:w-80',
            date: 'text-sm text-blue-100',
            time: 'text-3xl font-bold tabular-nums text-[var(--jmc-gold)]',
            photo: 'h-40 w-40 rounded-lg border-2 border-[var(--jmc-gold)] bg-white object-cover',
            resultCard: 'w-full space-y-2 rounded-lg bg-white p-4 text-center text-[var(--jmc-ink)] shadow-sm',
            resultMeta: 'text-xs font-medium text-[var(--jmc-blue)]',
            resultNote: 'text-xs text-slate-500',
            main: 'relative flex flex-1 items-center justify-center bg-[var(--jmc-page)] p-4',
            video: 'max-h-[70vh] w-full max-w-3xl rounded-lg border-4 border-white shadow-md ring-2 ring-[var(--jmc-gold)]',
            footer: 'overflow-hidden border-t border-[var(--jmc-gold)] bg-[var(--jmc-green)] py-3 text-white',
            modalTitle: 'mb-4 text-lg font-semibold text-[var(--jmc-navy)]',
            modalButton: 'rounded-lg border border-[var(--jmc-blue)]/30 px-4 py-3 text-sm font-medium text-[var(--jmc-navy)] hover:bg-muted',
            feedbackTitle: 'mb-4 text-center text-lg font-semibold text-[var(--jmc-navy)]',
            feedbackButton: 'flex flex-col items-center gap-1 rounded-lg border border-[var(--jmc-blue)]/30 p-3 text-[var(--jmc-navy)] hover:bg-muted',
            skipButton: 'mt-4 w-full rounded-lg border border-[var(--jmc-green)]/40 py-2 text-sm text-[var(--jmc-green)] hover:bg-muted',
        }
        : {
            page: 'flex min-h-screen flex-col bg-neutral-900 text-white',
            header: 'border-b border-neutral-700 px-6 py-4',
            eyebrow: 'text-sm uppercase tracking-widest text-neutral-400',
            sidebar: 'flex w-full flex-col items-center gap-4 bg-neutral-800 p-6 lg:w-80',
            date: 'text-sm text-neutral-400',
            time: 'text-3xl font-bold tabular-nums',
            photo: 'h-40 w-40 rounded-lg border-2 border-neutral-600 object-cover',
            resultCard: 'w-full space-y-2 rounded-lg bg-neutral-700 p-4 text-center',
            resultMeta: 'text-xs uppercase text-neutral-400',
            resultNote: 'text-xs text-neutral-400',
            main: 'relative flex flex-1 items-center justify-center p-4',
            video: 'max-h-[70vh] w-full max-w-3xl rounded-lg',
            footer: 'overflow-hidden border-t border-neutral-700 bg-neutral-950 py-3',
            modalTitle: 'mb-4 text-lg font-semibold',
            modalButton: 'rounded-lg border border-neutral-300 px-4 py-3 text-sm font-medium hover:bg-neutral-100',
            feedbackTitle: 'mb-4 text-center text-lg font-semibold',
            feedbackButton: 'flex flex-col items-center gap-1 rounded-lg border border-neutral-300 p-3 hover:bg-neutral-100',
            skipButton: 'mt-4 w-full rounded-lg border border-neutral-300 py-2 text-sm text-neutral-600 hover:bg-neutral-100',
        };

    useEffect(() => {
        const tick = setInterval(() => setNow(new Date()), 1000);
        return () => {
            clearInterval(tick);
        };
    }, []);

    const clearDisplay = useCallback(() => {
        if (feedbackModalOpen) {
            return;
        }
        setDisplay({ kind: 'idle' });
        setProfileSrc('/images/2x2_undifined_gender.jpg');
        setCurrentStudentId(null);
        setPendingPatron(null);
    }, [feedbackModalOpen]);

    const scheduleClear = useCallback(
        (delayMs: number) => {
            if (clearTimerRef.current) {
                clearTimeout(clearTimerRef.current);
            }
            clearTimerRef.current = setTimeout(clearDisplay, delayMs);
        },
        [clearDisplay],
    );

    const showPatron = useCallback(
        (
            patron: PatronInfo,
            status: string,
            scannedAt: string,
            section?: string,
        ) => {
            setProfileSrc(profileUrl(patron.profile_picture));
            setDisplay({
                kind: 'patron',
                firstname: patron.firstname,
                lastname: patron.lastname,
                status,
                timestamp: scannedAt,
                section,
                profilePicture: patron.profile_picture,
            });
        },
        [],
    );

    const processSection = useCallback(
        async (
            patronType: 'student' | 'employee',
            patronId: number,
            section: string | null,
            patron: PatronInfo,
            studentId: number | null,
        ) => {
            const response = await fetch(sectionEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    patron_type: patronType,
                    patron_id: patronId,
                    section,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                setDisplay({ kind: 'error', message: data.message ?? 'Unable to record attendance.' });
                scheduleClear(2000);
                return;
            }

            showPatron(patron, data.status, data.scanned_at, section ?? undefined);

            const feedbackOn =
                patronType === 'student' &&
                data.status?.toUpperCase() === 'OUT' &&
                (data.logout_feedback_enabled ?? logoutFeedbackEnabled);

            if (feedbackOn && studentId) {
                setCurrentStudentId(studentId);
                if (clearTimerRef.current) {
                    clearTimeout(clearTimerRef.current);
                }
                setTimeout(() => setFeedbackModalOpen(true), 500);
            } else {
                scheduleClear(data.status?.toUpperCase() === 'OUT' ? 3000 : 2000);
            }
        },
        [logoutFeedbackEnabled, scheduleClear, sectionEndpoint, showPatron],
    );

    const handleScanResult = useCallback(
        async (data: Record<string, unknown>) => {
            if (feedbackModalOpen) {
                setFeedbackModalOpen(false);
            }
            clearDisplay();

            if (data.type === 'error') {
                setDisplay({ kind: 'error', message: String(data.message ?? 'Unknown error') });
                scheduleClear(2000);
                return;
            }

            if (data.type === 'book') {
                const book = data.book as {
                    title_statement?: string | null;
                    copy_identifier_summary?: string | null;
                };

                setProfileSrc('/images/2x2_undifined_gender.jpg');
                setDisplay({
                    kind: 'book',
                    bookTitle: book.title_statement ?? 'Untitled book',
                    bookStatus: String(data.book_status ?? 'Unknown'),
                    copyIdentifier: book.copy_identifier_summary ?? undefined,
                    message: String(data.message ?? ''),
                });
                scheduleClear(3000);
                return;
            }

            const patronType = data.patron_type as 'student' | 'employee';
            const patron = data.patron as PatronInfo;
            const patronId = data.patron_id as number;
            const nextStatus = String(data.next_status ?? '').toUpperCase();
            const studentId = data.student_id as number | null;

            setPendingPatron(patron);
            setPendingPatronType(patronType);
            if (studentId) {
                setCurrentStudentId(studentId);
            }

            setProfileSrc(profileUrl(patron.profile_picture));

            if (nextStatus === 'OUT') {
                await processSection(patronType, patronId, null, patron, studentId);
                return;
            }

            const sectionPickerOn =
                (data.section_picker_enabled ?? sectionPickerEnabled) && hasSections;

            if (sectionPickerOn) {
                setSectionModalOpen(true);
                return;
            }

            await processSection(patronType, patronId, null, patron, studentId);
        },
        [
            clearDisplay,
            feedbackModalOpen,
            hasSections,
            processSection,
            scheduleClear,
            sectionPickerEnabled,
        ],
    );

    const submitScan = useCallback(
        async (qrcode: string) => {
            if (cooldownRef.current) {
                return;
            }
            cooldownRef.current = true;
            setTimeout(() => {
                cooldownRef.current = false;
            }, 300);

            const formData = new FormData();
            formData.append('qrcode', qrcode);
            formData.append('_token', csrfToken());

            try {
                const response = await fetch(scanEndpoint, { method: 'POST', body: formData });
                const data = await response.json();
                await handleScanResult(data);
            } catch {
                setDisplay({ kind: 'error', message: 'Network error. Please try again.' });
                scheduleClear(2000);
            }
        },
        [handleScanResult, scanEndpoint, scheduleClear],
    );

    useScannerInput({
        enabled: !sectionModalOpen && !feedbackModalOpen,
        idleTimeout: 300,
        onScan: submitScan,
    });

    const selectSection = useCallback(
        async (section: string) => {
            if (!pendingPatron) {
                return;
            }
            setSectionModalOpen(false);
            await processSection(
                pendingPatronType,
                pendingPatron.id,
                section,
                pendingPatron,
                pendingPatronType === 'student' ? pendingPatron.id : null,
            );
        },
        [pendingPatron, pendingPatronType, processSection],
    );

    const sendFeedback = useCallback(
        async (rating: string | null, declined: boolean) => {
            if (!currentStudentId || !feedbackEndpoint) {
                setFeedbackModalOpen(false);
                clearDisplay();
                return;
            }

            try {
                await fetch(feedbackEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken(),
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        student_id: currentStudentId,
                        rating,
                        declined: declined ? 1 : 0,
                    }),
                });
            } catch {
                // ignore
            } finally {
                setFeedbackModalOpen(false);
                clearDisplay();
            }
        },
        [clearDisplay, currentStudentId, feedbackEndpoint],
    );

    return (
        <>
            <Head title="Attendance Scanner" />

            <div className={`flex min-h-screen flex-col ${theme.page}`}>
                <header className={theme.header}>
                    <p className={theme.eyebrow}>Powered by JMC</p>
                    <h1 className="text-xl font-semibold">Attendance Scanner</h1>
                </header>

                <div className="flex flex-1 flex-col lg:flex-row">
                    <aside className={theme.sidebar}>
                        <div className="text-center">
                            <p className={theme.date}>
                                {now.toLocaleDateString('en-GB', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                            <p className={theme.time}>
                                {now.toLocaleTimeString('en-US')}
                            </p>
                        </div>

                        <img
                            src={profileSrc}
                            alt="Profile"
                            className={theme.photo}
                        />

                        {display.kind === 'patron' && (
                            <div className={theme.resultCard}>
                                <p className="text-lg font-semibold">
                                    {display.firstname} {display.lastname}
                                </p>
                                <p className={theme.resultMeta}>
                                    {display.section ?? 'Name'}
                                </p>
                                <p
                                    className={`inline-block rounded-full px-4 py-1 text-sm font-bold ${
                                        display.status?.toUpperCase() === 'OUT'
                                            ? 'bg-[var(--status-danger)] text-white'
                                            : 'bg-[var(--status-success)] text-white'
                                    }`}
                                >
                                    {display.status}
                                </p>
                                {display.timestamp && (
                                    <p className={theme.resultNote}>{display.timestamp}</p>
                                )}
                            </div>
                        )}

                        {display.kind === 'book' && (
                            <div className={theme.resultCard}>
                                <p className="text-lg font-semibold">{display.bookTitle}</p>
                                <p className={theme.resultMeta}>
                                    {display.copyIdentifier ?? 'Book Title'}
                                </p>
                                <p
                                    className={`inline-block rounded-full px-4 py-1 text-sm font-bold ${
                                        display.bookStatus?.toLowerCase() === 'not checked out'
                                            ? 'bg-[var(--status-danger)] text-white'
                                            : 'bg-[var(--status-success)] text-white'
                                    }`}
                                >
                                    {display.bookStatus}
                                </p>
                                {display.message && (
                                    <p className={theme.resultNote}>{display.message}</p>
                                )}
                            </div>
                        )}

                        {display.kind === 'error' && (
                            <div className="w-full rounded-lg bg-red-50 p-4 text-center text-red-900 shadow-lg ring-1 ring-red-200">
                                <p className="font-semibold">{display.message}</p>
                                <p className="text-xs font-semibold text-red-700">Error</p>
                            </div>
                        )}
                    </aside>

                    <main className={theme.main}>
                        <video
                            key={attendanceVideoUrl}
                            autoPlay
                            loop
                            muted
                            controls
                            className={theme.video}
                        >
                            <source src={attendanceVideoUrl} type="video/mp4" />
                        </video>
                    </main>
                </div>

                <footer className={theme.footer}>
                    <p className="text-center text-sm font-semibold">
                        Welcome to Jose Maria College Foundation Inc.
                    </p>
                </footer>
            </div>

            <div className="sr-only" aria-live="polite" aria-atomic="true">
                {display.kind === 'patron' && `${display.firstname} ${display.lastname}, ${display.status}`}
                {display.kind === 'book' && `${display.bookTitle}, ${display.bookStatus}`}
            </div>
            {display.kind === 'error' && <div className="sr-only" role="alert">{display.message}</div>}

            <Dialog open={sectionModalOpen} onOpenChange={(open) => {
                if (!open) {
                    setSectionModalOpen(false);
                    clearDisplay();
                }
            }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Select section</DialogTitle>
                        <DialogDescription>Choose the section for this attendance entry. Closing cancels the scan.</DialogDescription>
                    </DialogHeader>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {attendanceSections.map((section) => (
                                <button
                                    key={section}
                                    type="button"
                                    className={theme.modalButton}
                                    onClick={() => selectSection(section)}
                                >
                                    {section}
                                </button>
                            ))}
                        </div>
                </DialogContent>
            </Dialog>

            <Dialog open={feedbackModalOpen} onOpenChange={(open) => {
                if (!open && feedbackModalOpen) void sendFeedback(null, true);
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>How was your library experience?</DialogTitle>
                        <DialogDescription>Select a rating or skip this optional question.</DialogDescription>
                    </DialogHeader>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {(
                                [
                                    ['excellent', '😊', 'Excellent'],
                                    ['good', '🙂', 'Good'],
                                    ['medium', '😐', 'Medium'],
                                    ['poor', '🙁', 'Poor'],
                                    ['very_bad', '😠', 'Very Bad'],
                                ] as const
                            ).map(([rating, emoji, label]) => (
                                <button
                                    key={rating}
                                    type="button"
                                    className={theme.feedbackButton}
                                    onClick={() => sendFeedback(rating, false)}
                                >
                                    <span className="text-2xl">{emoji}</span>
                                    <span className="text-xs">{label}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            className={theme.skipButton}
                            onClick={() => sendFeedback(null, true)}
                        >
                            Skip
                        </button>
                </DialogContent>
            </Dialog>
        </>
    );
}
