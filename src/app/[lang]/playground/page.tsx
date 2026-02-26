import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';

export default async function PlaygroundPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <main>
      {/* HEADER PLAYGROUNDU */}
      <section style={{ 
        width: '100%', 
        minHeight: '20vh', 
        padding: 'calc(var(--space-4) * 2) var(--space-4)',
        borderBottom: '1px solid var(--color-text)',
      }}>
        <h1 
          style={{ 
            fontFamily: 'var(--font-ibm-plex-mono)', 
            fontSize: 'var(--text-title)',
            marginBottom: 'var(--space-2)'
          }}
        >
          X_PLAYGROUND
        </h1>
        <p style={{ fontFamily: 'var(--font-vt323)', fontSize: 'var(--text-label)', opacity: 0.6 }}>
          [ STANOWISKA TESTOWE KLOCKÓW SYSTEMU - KAŻDE ZAJMUJE 50VH ORAZ PEŁNĄ SZEROKOŚĆ ]
        </p>
      </section>

      {/* STANOWISKO 1: Typography Scaler / Comparison */}
      <section style={{ 
        width: '100vw', 
        minHeight: '50vh', 
        borderBottom: '1px solid var(--color-text)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        padding: 'calc(var(--space-4) * 2) var(--space-4) var(--space-4)'
      }}>
        {/* Etykieta Slotu */}
        <div style={{ position: 'absolute', top: 'var(--space-2)', left: 'var(--space-2)', fontFamily: 'var(--font-vt323)', opacity: 0.5, zIndex: 10 }}>
          [01] TYPOGRAPHY_SCALE_COMPARATOR
        </div>

        {/* Przerywana Linia Środkowa Pionu */}
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          width: '1px',
          borderLeft: '1px dashed var(--color-text)',
          opacity: 'var(--divider-opacity)'
        }} />

        {/* Nagłówki kolumn */}
        <div style={{ display: 'flex', marginBottom: 'var(--space-4)' }}>
           <div style={{ flex: 1, fontFamily: 'var(--font-vt323)', opacity: 0.5 }}>[ IBM PLEX MONO ]</div>
           <div style={{ flex: 1, fontFamily: 'var(--font-vt323)', opacity: 0.5, paddingLeft: 'var(--space-4)' }}>[ VT323 ]</div>
        </div>

        {/* Wiersze z rozmiarem */}
        { [
            { var: '--text-hero', label: 'Display' },
            { var: '--text-title', label: 'Nagłówek' },
            { var: '--text-body', label: 'Zwykły tekst (Body)' },
            { var: '--text-label', label: 'Etykieta (Label)' },
            { var: '--text-micro', label: 'Mikro (Micro)' }
          ].map((item, idx) => {
            return (
            <div key={idx} style={{ 
              display: 'flex', 
              position: 'relative', 
              marginBottom: 'calc(var(--space-4) * 1.5)',
              alignItems: 'baseline'
            }}>
               {/* Kolumna lewa - IBM */}
               <div style={{ flex: 1, position: 'relative' }}>
                 <div style={{ position: 'absolute', top: '-1.5rem', fontSize: '10px', opacity: 0.5 }} className="font-ibm">{item.var}</div>
                 <span 
                   className="font-ibm"
                   style={{ 
                     position: 'relative',
                     fontSize: `var(${item.var})`, 
                     lineHeight: 1,
                     display: 'inline-block',
                   }}
                 >
                   {/* Linia bazowa (dół "s", baseline) - IBM Plex Mono Ascent: 1045, Descent: -285, UPM: 1000 => Baseline offset od dołu bounding boxa to ok. 285/1330 = ~0.21em (przy line-height normal)
                       Gdy lineHeight: 1, bounding box jest 1em.
                       Około 0.22em dziala... jednak przy lineheight 1 "em" dziala ciut inaczej... 
                       Sprobujmy wyregulować te wartosci em blizej renderu: */}
                   <div style={{ 
                     position: 'absolute', 
                     left: '-50vw', width: '200vw', 
                     bottom: '0.12em', height: '1px', 
                     background: 'var(--color-text)', 
                     opacity: 0.35, zIndex: -1 
                   }} />
                   {/* Linia x-height (góra "s") - wysokość małych liter */}
                   <div style={{ 
                     position: 'absolute', 
                     left: '-50vw', width: '200vw', 
                     bottom: '0.64em', height: '1px', 
                     background: 'var(--color-text)', 
                     opacity: 0.35, zIndex: -1 
                   }} />
                   {item.label}
                 </span>
               </div>

               {/* Kolumna prawa - VT323 */}
               <div style={{ flex: 1, paddingLeft: 'var(--space-4)', position: 'relative' }}>
                 <div style={{ position: 'absolute', top: '-1.5rem', fontSize: '10px', opacity: 0.5 }} className="font-ibm">{item.var}</div>
                 <span 
                   className="font-vt"
                   style={{ 
                     position: 'relative',
                     fontSize: `var(${item.var})`, 
                     lineHeight: 1,
                     display: 'inline-block',
                   }}
                 >
                   {item.label}
                 </span>
               </div>
            </div>
            );
        })}
      </section>
      
      {/* STANOWISKO 2: Testy Interakcji i Buttonów */}
      <section style={{ 
        width: '100vw', 
        minHeight: '50vh', 
        borderBottom: '1px solid var(--color-text)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'var(--space-4)',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: 'var(--space-2)', left: 'var(--space-2)', fontFamily: 'var(--font-vt323)', opacity: 0.5 }}>
          [02] INTERACTIVE_ELEMENTS_AND_MOTION
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', alignItems: 'center' }}>
           {/* Row 1: Primary System Buttons */}
           <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
             <button className="btn-system">
               <span className="btn-label">[ VIEW PROJECT ]</span>
               <span className="btn-label-bold" aria-hidden="true">[ VIEW PROJECT ]</span>
             </button>
             <button className="btn-system">
               <span className="btn-label">[ CONTACT -&gt; ]</span>
               <span className="btn-label-bold" aria-hidden="true">[ CONTACT -&gt; ]</span>
             </button>
             <button className="btn-system" disabled>
               <span className="btn-label">[ SYSTEM LOCKED ]</span>
               <span className="btn-label-bold" aria-hidden="true">[ SYSTEM LOCKED ]</span>
             </button>
           </div>
           
           {/* Row 2: V2 Buttons (Inset shadow + opacity active) */}
           <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
             <button className="btn-system v2">
               <span className="btn-label">[ VIEW PROJECT ]</span>
               <span className="btn-label-bold" aria-hidden="true">[ VIEW PROJECT ]</span>
             </button>
             <button className="btn-system v2">
               <span className="btn-label">[ CONTACT -&gt; ]</span>
               <span className="btn-label-bold" aria-hidden="true">[ CONTACT -&gt; ]</span>
             </button>
             <button className="btn-system v2" disabled>
               <span className="btn-label">[ SYSTEM LOCKED ]</span>
               <span className="btn-label-bold" aria-hidden="true">[ SYSTEM LOCKED ]</span>
             </button>
           </div>

           {/* Row 3: V3 Buttons (Clamping Brackets Option A) */}
           <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
             <button className="btn-system v3">
               <span className="btn-label">VIEW PROJECT</span>
               <span className="btn-label-bold" aria-hidden="true">VIEW PROJECT</span>
             </button>
             <button className="btn-system v3">
               <span className="btn-label">CONTACT -&gt;</span>
               <span className="btn-label-bold" aria-hidden="true">CONTACT -&gt;</span>
             </button>
             <button className="btn-system v3" disabled>
               <span className="btn-label">SYSTEM LOCKED</span>
               <span className="btn-label-bold" aria-hidden="true">SYSTEM LOCKED</span>
             </button>
           </div>

           {/* Row 4: V4 Buttons (Clamping Brackets Option B - Wider spacing) */}
           <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
             <button className="btn-system v4">
               <span className="btn-label">VIEW PROJECT</span>
               <span className="btn-label-bold" aria-hidden="true">VIEW PROJECT</span>
             </button>
             <button className="btn-system v4">
               <span className="btn-label">CONTACT -&gt;</span>
               <span className="btn-label-bold" aria-hidden="true">CONTACT -&gt;</span>
             </button>
             <button className="btn-system v4" disabled>
               <span className="btn-label">SYSTEM LOCKED</span>
               <span className="btn-label-bold" aria-hidden="true">SYSTEM LOCKED</span>
             </button>
           </div>
           
           {/* Row 2: Text Links */}
           <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginTop: 'var(--space-2)' }}>
             <p className="font-ibm">
               Zwykły tekst i{' '}
               <a href="#" className="link-system">
                 <span className="link-label">ostry link</span>
                 <span className="link-label-bold" aria-hidden="true">ostry link</span>
               </a>{' '}
               w środku zdania.
             </p>
           </div>
        </div>
      </section>
    </main>
  );
}
