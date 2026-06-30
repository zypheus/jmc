export default function KioskAmbientBackground() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[var(--jmc-blue)]/25 blur-[100px] motion-reduce:blur-3xl" />
            <div className="absolute right-[-10%] top-[15%] h-96 w-96 rounded-full bg-[var(--jmc-green)]/18 blur-[110px] motion-reduce:blur-3xl" />
            <div className="absolute bottom-[-5%] left-[20%] h-80 w-80 rounded-full bg-[var(--jmc-gold)]/12 blur-[90px] motion-reduce:blur-3xl" />
            <div className="absolute bottom-[20%] right-[15%] h-56 w-56 rounded-full bg-[var(--jmc-blue)]/20 blur-[80px] motion-reduce:blur-3xl" />
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                    backgroundSize: '28px 28px',
                }}
            />
        </div>
    );
}
