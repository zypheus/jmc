interface KioskBrandMarkProps {
    size?: 'md' | 'lg';
    showTagline?: boolean;
    title?: string;
    subtitle?: string;
    onDark?: boolean;
}

const LOGO_SRC = '/images/d.png';

export default function KioskBrandMark({
    size = 'md',
    showTagline = false,
    title = 'Library patron lookup',
    subtitle = 'Jose Maria College',
    onDark = true,
}: KioskBrandMarkProps) {
    const logoClass = size === 'lg' ? 'h-32 w-32 sm:h-36 sm:w-36' : 'h-14 w-14 sm:h-16 sm:w-16';

    return (
        <div className="flex flex-col items-center text-center">
            <div className="relative mb-4 flex items-center justify-center">
                <div
                    className="kiosk-logo-glow absolute inset-0 scale-110 rounded-full opacity-60"
                    aria-hidden
                />
                <img
                    src={LOGO_SRC}
                    alt="JMC Library"
                    className={`relative ${logoClass} object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]`}
                />
            </div>
            {showTagline && (
                <>
                    <p
                        className={`font-display text-2xl font-semibold tracking-tight sm:text-[1.75rem] ${
                            onDark ? 'text-white' : 'text-foreground'
                        }`}
                    >
                        {title}
                    </p>
                    <p className={`mt-2 max-w-sm text-sm leading-relaxed ${onDark ? 'text-white/60' : 'text-muted-foreground'}`}>
                        {subtitle}
                    </p>
                </>
            )}
        </div>
    );
}

export { LOGO_SRC };
