import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

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
    const inputRef = useRef<HTMLTextAreaElement>(null);
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
            page: 'bg-[#f5f7fa] text-[#1f2937]',
            header: 'border-b border-[#173b7a] bg-[#1f4ea7] px-6 py-4 text-white shadow-sm',
            eyebrow: 'text-sm uppercase tracking-widest text-[#ffd700]',
            sidebar: 'flex w-full flex-col items-center gap-4 bg-[#15366f] p-6 text-white lg:w-80',
            date: 'text-sm text-blue-100',
            time: 'text-3xl font-bold tabular-nums text-[#ffd700]',
            photo: 'h-40 w-40 rounded-lg border-2 border-[#ffd700] bg-white object-cover shadow-lg',
            resultCard: 'w-full space-y-2 rounded-lg bg-white p-4 text-center text-[#1f2937] shadow-lg',
            resultMeta: 'text-xs uppercase text-[#1f4ea7]',
            resultNote: 'text-xs text-slate-500',
            main: 'relative flex flex-1 items-center justify-center bg-[#eef3fb] p-4',
            video: 'max-h-[70vh] w-full max-w-3xl rounded-lg border-4 border-white shadow-2xl ring-2 ring-[#ffd700]',
            footer: 'overflow-hidden border-t border-[#ffd700] bg-[#2e7d32] py-3 text-white',
            modalTitle: 'mb-4 text-lg font-semibold text-[#15366f]',
            modalButton: 'rounded-lg border border-[#1f4ea7]/30 px-4 py-3 text-sm font-medium text-[#15366f] hover:bg-[#eef3fb]',
            feedbackTitle: 'mb-4 text-center text-lg font-semibold text-[#15366f]',
            feedbackButton: 'flex flex-col items-center gap-1 rounded-lg border border-[#1f4ea7]/30 p-3 text-[#15366f] hover:bg-[#eef3fb]',
            skipButton: 'mt-4 w-full rounded-lg border border-[#2e7d32]/40 py-2 text-sm text-[#2e7d32] hover:bg-green-50',
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
        const focus = setInterval(() => inputRef.current?.focus(), 100);
        inputRef.current?.focus();
        return () => {
            clearInterval(tick);
            clearInterval(focus);
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

    const handleKeyPress = useCallback(
        async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (event.key !== 'Enter') {
                return;
            }
            event.preventDefault();
            if (cooldownRef.current) {
                return;
            }
            cooldownRef.current = true;
            setTimeout(() => {
                cooldownRef.current = false;
            }, 300);

            const qrcode = inputRef.current?.value.trim().replace(/\r/g, '') ?? '';
            if (!qrcode) {
                return;
            }

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

            if (inputRef.current) {
                inputRef.current.value = '';
            }
        },
        [handleScanResult, scanEndpoint, scheduleClear],
    );

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
                inputRef.current?.focus();
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
                inputRef.current?.focus();
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
                                            ? 'bg-[#dc2626] text-white'
                                            : 'bg-[#2e7d32] text-white'
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
                                            ? 'bg-[#dc2626] text-white'
                                            : 'bg-[#2e7d32] text-white'
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
                                <p className="text-xs uppercase text-red-600">Error</p>
                            </div>
                        )}
                    </aside>

                    <main className={theme.main}>
                        <textarea
                            ref={inputRef}
                            name="qrcode"
                            autoComplete="off"
                            aria-hidden="true"
                            tabIndex={-1}
                            className="pointer-events-none absolute opacity-0"
                            onKeyDown={handleKeyPress}
                        />
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
                    <p className="animate-pulse whitespace-nowrap text-center text-sm font-semibold">
                        Welcome to Governor Generoso College of Arts, Sciences and Technology
                    </p>
                </footer>
            </div>

            {sectionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 text-[#1f2937] shadow-xl">
                        <h2 className={theme.modalTitle}>Select Section</h2>
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
                    </div>
                </div>
            )}

            {feedbackModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 text-[#1f2937] shadow-xl">
                        <h2 className={theme.feedbackTitle}>
                            How was your library experience?
                        </h2>
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
                    </div>
                </div>
            )}
        </>
    );
}
