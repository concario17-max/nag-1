import type { ReactNode } from 'react';

interface TranslationSectionProps {
    ham?: string;
}

const Block = ({ label, children }: { label: string; children: ReactNode }) => (
    <section className="border-t border-gold-border/10 pt-4 dark:border-dark-border/45">
        <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-gold-primary/70 dark:text-gold-light/70">{label}</p>
        <div className="mt-3 space-y-3">{children}</div>
    </section>
);

export const TranslationSection = ({ ham }: TranslationSectionProps) => {
    if (!ham) {
        return null;
    }

    return (
        <section className="mx-auto w-full space-y-4 px-4 sm:px-6 lg:px-8">
            <Block label="English Translation">
                <p className="whitespace-pre-line break-keep font-sans text-[15px] leading-8 text-text-primary dark:text-dark-text-primary sm:text-[16px]">
                    {ham}
                </p>
            </Block>
        </section>
    );
};
export default TranslationSection;
