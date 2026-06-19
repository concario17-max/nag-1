const sanitizeCopticDisplay = (value: string): string => {
    return String(value ?? '')
        .replace(/\r/g, '')
        .replace(/[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff]/g, '')
        .replace(/[§⟨⟩⟦⟧→←]/g, '')
        .replace(/[^\u2C80-\u2CFF\u0370-\u03FF\s\n\[\]\(\){}<>·’'‐\-.,;:!?/|]/g, '');
};

interface SutraContentProps {
    sanskrit: string;
    pronunciation: string;
    pronunciationKr?: string;
}

export const SutraContent = ({ sanskrit, pronunciation, pronunciationKr }: SutraContentProps) => {
    const cleanPronunciation = pronunciation?.replace(/\|+/g, '').replace(/\s+/g, ' ').trim();
    const cleanPronunciationKr = pronunciationKr?.replace(/\s+/g, ' ').trim();
    const sanitizedCoptic = sanitizeCopticDisplay(sanskrit).replace(/[\r\n]+/g, '\n');

    return (
        <section className="mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="border-b border-gold-border/10 pb-5 text-center dark:border-dark-border/45">
                <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-gold-primary/70 dark:text-gold-light/70">
                    Coptic Original
                </p>
                <p className="mt-4 whitespace-pre-line break-keep font-antinoou text-[clamp(1.2rem,0.95rem+1.0vw,2.1rem)] leading-[1.38] tracking-[0.015em] text-[#4A0404] dark:text-[#F0A2A2] antialiased">
                    {sanitizedCoptic}
                </p>
            </div>

            <div className="mt-4 space-y-3 text-center">
                {cleanPronunciation ? (
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-text-secondary/60 dark:text-dark-text-secondary/65">
                            Pronunciation
                        </p>
                        <p className="mt-2 whitespace-pre-line break-keep font-sans text-[11px] uppercase tracking-[0.18em] text-text-secondary dark:text-dark-text-secondary sm:text-[12px]">
                            {cleanPronunciation}
                        </p>
                    </div>
                ) : null}

                {cleanPronunciationKr ? (
                    <p className="whitespace-pre-line break-keep font-sans text-[13px] leading-8 tracking-[0.04em] text-text-secondary dark:text-dark-text-secondary sm:text-[14px]">
                        {cleanPronunciationKr}
                    </p>
                ) : null}
            </div>
        </section>
    );
};

