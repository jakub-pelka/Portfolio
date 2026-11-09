import styles from './AboutSection.module.css';

interface AboutSectionProps {
  /** Etykieta sekcji, np. "O mnie" (renderowana jako [ O MNIE ]). */
  label: string;
  children: React.ReactNode;
}

export function AboutSection({ label, children }: AboutSectionProps) {
  return (
    <section id="about" className={`jp-web-section ${styles.section}`}>
      {/* Pusty slot: tylko punkt odniesienia dla PortfolioLanyard (montowanego
          raz w page.tsx). Karta 3D wisi na linii nad sekcją, obok tekstu. */}
      <div id="about-lanyard-slot" className={styles.lanyardSlot} aria-hidden="true" />
      <div className="jp-web-section__inner">
        <div className={styles.text}>
          <p className="jp-web-section__label">[ {label} ]</p>
          {children}
        </div>
      </div>
    </section>
  );
}
