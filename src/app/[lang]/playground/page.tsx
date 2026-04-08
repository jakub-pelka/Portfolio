import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { MiniScrollB } from '@/components/ui/MiniScrollB';
import { MiniScrollC } from '@/components/ui/MiniScrollC';
import { IndicatorMorph } from '@/components/ui/IndicatorMorph';
import { Button } from '@/components/ui/Button';
import { HalftoneShadow } from '@/components/ui/HalftoneShadow';

export default async function PlaygroundPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params as { lang: Locale };
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
           
           {/* Row 5: React Component Abstraction (Button.tsx) */}
           <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px dashed var(--color-border)' }}>
             <p className="font-vt" style={{ paddingRight: 'var(--space-2)', opacity: 0.6 }}>[ REACT COMPONENT ]</p>
             <Button variant="default">VIEW PROJECT</Button>
             <Button variant="v2" rawText={true}>[ CONTACT -&gt; ]</Button>
             <Button variant="v3" disabled>SYSTEM LOCKED</Button>
             <Button variant="v4" href="#test">NEXT.JS LINK</Button>
           </div>
           
           {/* Row 6: Text Links */}
           <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginTop: 'var(--space-2)' }}>
             <p className="font-ibm">
               Zwykły tekst i{' '}
               <a href="#test" className="link-system">
                 ostry link
               </a>{' '}
               w środku zdania.
             </p>
           </div>
        </div>
      </section>

      {/* STANOWISKO 3: Mini-scrolling & Indicators */}
      <section style={{
        width: '100vw',
        minHeight: '80vh',
        borderBottom: '1px solid var(--color-text)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        position: 'relative',
        gap: 'var(--space-4)'
      }}>
        <div style={{ position: 'absolute', top: 'var(--space-2)', left: 'var(--space-2)', fontFamily: 'var(--font-vt323)', opacity: 0.5 }}>
          [03] MINIATURE_SCROLLING_MECHANISM
        </div>

        {/* Scroll Containers Wrapper */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Scroll Container 1 Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ fontFamily: 'var(--font-vt323)', opacity: 0.6, fontSize: 'var(--text-label)' }}>[ TYPE_B: TRACK ]</div>
            <MiniScrollB />
          </div>

          {/* Scroll Container 2 Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ fontFamily: 'var(--font-vt323)', opacity: 0.6, fontSize: 'var(--text-label)' }}>[ TYPE_C: NESTED ]</div>
            <MiniScrollC />
          </div>

          {/* Scroll Container 3 Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ fontFamily: 'var(--font-vt323)', opacity: 0.6, fontSize: 'var(--text-label)' }}>[ TYPE_D: TBD ]</div>
            <MiniScrollC />
          </div>
        </div>
      </section>

      {/* STANOWISKO 4: Indicator Morph Easter Egg */}
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
          [04] INDICATOR_MORPH_PROTOTYPE
        </div>
        <IndicatorMorph />
      </section>

      {/* STANOWISKO 5: Puste Stany i System Feedback */}
      <section style={{
        width: '100vw',
        minHeight: '60vh',
        borderBottom: '1px solid var(--color-text)',
        display: 'flex',
        flexDirection: 'column',
        padding: 'calc(var(--space-4) * 2) var(--space-4) var(--space-4)',
        position: 'relative',
        gap: 'var(--space-4)'
      }}>
        <div style={{ position: 'absolute', top: 'var(--space-2)', left: 'var(--space-2)', fontFamily: 'var(--font-vt323)', opacity: 0.5 }}>
          [05] SYSTEM_FEEDBACK_AND_EMPTY_STATES
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          {/* Kolumna 1: Empty States */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ fontFamily: 'var(--font-vt323)', opacity: 0.6, fontSize: 'var(--text-label)' }}>[ EMPTY_STATE_VARIANTS ]</div>
            
            {/* Wariant 1: Klatka Modułowa (Dashed Border) */}
            <div style={{
              border: '1px dashed var(--color-text)',
              padding: 'calc(var(--space-4) * 1.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-1)',
              opacity: 0.8
            }}>
               <div style={{ fontFamily: 'var(--font-vt323)', fontSize: 'clamp(2rem, 4vw, 3rem)' }}>[ ∅ ]</div>
               <div className="font-ibm" style={{ fontSize: 'var(--text-label)', textTransform: 'uppercase', marginTop: 'var(--space-1)' }}>No_Records_Found</div>
               <div className="font-vt" style={{ fontSize: 'var(--text-body)', opacity: 0.8 }}>SYSTEM.QUERY_RETURNED_EMPTY_SET</div>
               <div style={{ marginTop: 'var(--space-2)' }}>
                  <Button variant="v3">RELOAD_DATA</Button>
               </div>
            </div>

            {/* Wariant 2: Raw Terminal Style (Left line) */}
            <div style={{
              borderLeft: '1px solid var(--color-text)',
              padding: 'var(--space-1) var(--space-3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-05)',
            }}>
               <div className="font-vt" style={{ color: 'var(--color-accent)', fontSize: 'var(--text-micro)' }}>&gt; fetch --target projects --filter active</div>
               <div className="font-ibm" style={{ fontSize: 'var(--text-label)' }}>[ WARN_204: CONTENT_UNAVAILABLE ]</div>
               <div className="font-vt" style={{ fontSize: 'var(--text-body)', opacity: 0.6, marginTop: 'var(--space-05)' }}>
                 Oczekiwanie na inicjalizację strumienia danych... 
                 <br />
                 Brak zadeklarowanych wpisów na ten moment.
               </div>
            </div>
          </div>

          {/* Kolumna 2: System Toasts / Alerts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ fontFamily: 'var(--font-vt323)', opacity: 0.6, fontSize: 'var(--text-label)' }}>[ SYSTEM_TOASTS_AND_ALERTS ]</div>
            
            {/* Alert: ERROR / CRITICAL */}
            <div style={{
              border: '1px solid var(--color-text)',
              borderLeft: '4px solid var(--color-text)',
              padding: 'var(--space-2) var(--space-3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-05)',
              position: 'relative',
              backgroundColor: 'var(--color-bg-secondary)'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                padding: 'var(--space-05) var(--space-1)', 
                fontFamily: 'var(--font-vt323)', 
                fontSize: '0.625rem', 
                borderBottom: '1px solid var(--color-text)', 
                borderLeft: '1px solid var(--color-text)' 
              }}>
                ERR_CODE:500
              </div>
              <div className="font-ibm" style={{ fontSize: 'var(--text-label)', fontWeight: 'bold' }}>[ SYSTEM_FAILURE ]</div>
              <div className="font-vt" style={{ fontSize: 'var(--text-body)', opacity: 0.8 }}>Krytyczny błąd strumienia danych. Odmowa dostępu.</div>
            </div>

            {/* Alert: SUCCESS / OK */}
            <div style={{
              border: '1px solid var(--color-border)',
              borderLeft: '4px solid var(--color-accent)',
              padding: 'var(--space-2) var(--space-3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-05)',
              backgroundColor: 'var(--color-bg)'
            }}>
              <div className="font-ibm" style={{ fontSize: 'var(--text-label)', fontWeight: 'bold', color: 'var(--color-accent)' }}>[ OPERATION_SUCCESS ]</div>
              <div className="font-vt" style={{ fontSize: 'var(--text-body)', opacity: 0.8 }}>Pomyślnie zsynchronizowano 14 obiektów. System jest gotowy.</div>
            </div>

            {/* Alert: INFO (Inverted Block) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-2)',
              padding: 'var(--space-1) var(--space-2)',
              background: 'var(--color-text)',
              color: 'var(--color-bg)',
              marginTop: 'var(--space-2)'
            }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                 <div className="font-ibm" style={{ fontSize: 'var(--text-label)', fontWeight: 'bold' }}>*</div>
                 <div className="font-vt" style={{ fontSize: 'var(--text-body)' }}>Update_Package_v2.0.4 is available.</div>
               </div>
               <div style={{ textDecoration: 'underline', fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px', cursor: 'pointer' }}>[INSTALL]</div>
            </div>
          </div>
        </div>
      </section>

      {/* STANOWISKO 6: Dither / Halftone Shadows */}
      <section style={{
        width: '100vw',
        minHeight: '60vh',
        borderBottom: '1px solid var(--color-text)',
        display: 'flex',
        flexDirection: 'column',
        padding: 'calc(var(--space-4) * 2) var(--space-4) var(--space-4)',
        position: 'relative',
        gap: 'var(--space-4)'
      }}>
        <div style={{ position: 'absolute', top: 'var(--space-2)', left: 'var(--space-2)', fontFamily: 'var(--font-vt323)', opacity: 0.5 }}>
          [06] HALFTONE_AND_DITHER_SHADOWS
        </div>
        
        <p className="font-ibm">Eksploracja cieni składających się z technicznych/komiksowych kropek (Dithering/Halftone). Kropki układają się w gradient wielkościowy.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
          
          {/* Opcja 1: Classic Dither Block Shadow (Uniform) */}
          <div style={{ position: 'relative', height: '200px' }}>
             {/* Shadow layer */}
             <div style={{
               position: 'absolute',
               top: '12px', left: '12px', right: '-20px', bottom: '-20px',
               zIndex: 0,
               backgroundImage: 'radial-gradient(var(--color-text) 30%, transparent 30%)',
               backgroundSize: '8px 8px',
               backgroundPosition: 'center center'
             }} />
             {/* Card Surface */}
             <div style={{
               position: 'absolute', inset: 0,
               backgroundColor: 'var(--color-bg)',
               border: '1px solid var(--color-text)',
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               zIndex: 1
             }}>
                <div style={{ fontFamily: 'var(--font-vt323)', fontSize: '1.5rem' }}>[ 01_DOT_MATRIX ]</div>
                <p className="font-vt" style={{ position: 'absolute', bottom: 'var(--space-2)', fontSize: '10px', opacity: 0.6 }}>Stała, wielka kropka (klasyczny raster)</p>
             </div>
          </div>

          {/* Opcja 2: 1-Bit Checkerboard */}
          <div style={{ position: 'relative', height: '200px' }}>
             {/* Shadow layer */}
             <div style={{
               position: 'absolute',
               top: '16px', left: '16px', right: '-16px', bottom: '-16px',
               zIndex: 0,
               backgroundImage: 'linear-gradient(45deg, var(--color-text) 25%, transparent 25%, transparent 75%, var(--color-text) 75%, var(--color-text)), linear-gradient(45deg, var(--color-text) 25%, transparent 25%, transparent 75%, var(--color-text) 75%, var(--color-text))',
               backgroundSize: '8px 8px',
               backgroundPosition: '0 0, 4px 4px'
             }} />
             {/* Card Surface */}
             <div style={{
               position: 'absolute', inset: 0,
               backgroundColor: 'var(--color-bg)',
               border: '1px solid var(--color-text)',
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               zIndex: 1
             }}>
                <div style={{ fontFamily: 'var(--font-vt323)', fontSize: '1.5rem' }}>[ 02_1BIT_CHECKER ]</div>
                <p className="font-vt" style={{ position: 'absolute', bottom: 'var(--space-2)', fontSize: '10px', opacity: 0.6 }}>Pikselowy Checkerboard (Game Boy style)</p>
             </div>
          </div>

          {/* Opcja 3a–3f: HalftoneShadow component — różne kierunki i rozmiary */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: '48px', alignItems: 'flex-start' }}>

            {/* bottom-right (domyślny), mała karta */}
            <div>
              <p className="font-vt" style={{ fontSize: '10px', opacity: 0.5, marginBottom: '6px' }}>direction: bottom-right | 260×120</p>
              <HalftoneShadow cardWidth={260} cardHeight={120} direction="bottom-right">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'var(--font-vt323)', fontSize: '1.2rem' }}>BOTTOM_RIGHT</div>
              </HalftoneShadow>
            </div>

            {/* bottom-left */}
            <div>
              <p className="font-vt" style={{ fontSize: '10px', opacity: 0.5, marginBottom: '6px' }}>direction: bottom-left | 260×120</p>
              <HalftoneShadow cardWidth={260} cardHeight={120} direction="bottom-left">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'var(--font-vt323)', fontSize: '1.2rem' }}>BOTTOM_LEFT</div>
              </HalftoneShadow>
            </div>

            {/* top-right */}
            <div>
              <p className="font-vt" style={{ fontSize: '10px', opacity: 0.5, marginBottom: '6px' }}>direction: top-right | 260×120</p>
              <HalftoneShadow cardWidth={260} cardHeight={120} direction="top-right">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'var(--font-vt323)', fontSize: '1.2rem' }}>TOP_RIGHT</div>
              </HalftoneShadow>
            </div>

            {/* right only */}
            <div>
              <p className="font-vt" style={{ fontSize: '10px', opacity: 0.5, marginBottom: '6px' }}>direction: right | 260×120</p>
              <HalftoneShadow cardWidth={260} cardHeight={120} direction="right">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'var(--font-vt323)', fontSize: '1.2rem' }}>RIGHT_ONLY</div>
              </HalftoneShadow>
            </div>

            {/* duża karta, duże kropki */}
            <div>
              <p className="font-vt" style={{ fontSize: '10px', opacity: 0.5, marginBottom: '6px' }}>duża karta 400×160, maxRadius=6</p>
              <HalftoneShadow cardWidth={400} cardHeight={160} direction="bottom-right" maxRadius={6} offset={20}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'var(--font-vt323)', fontSize: '1.4rem' }}>LARGE_CARD</div>
              </HalftoneShadow>
            </div>

            {/* mniejsze kropki, gęściej */}
            <div>
              <p className="font-vt" style={{ fontSize: '10px', opacity: 0.5, marginBottom: '6px' }}>grid=6, maxRadius=2.5 | 260×120</p>
              <HalftoneShadow cardWidth={260} cardHeight={120} direction="bottom-right" grid={6} maxRadius={2.5} minRadius={0.3}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'var(--font-vt323)', fontSize: '1.2rem' }}>FINE_RASTER</div>
              </HalftoneShadow>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
/*
· · · · · · · · · · · ·
· · · · · · · · · · · ·
· · █ █ █ █ █ █ █ █ · ·
· █ · · · · · · · · █ ·
· █ · · · · · · · · █ ·
· · █ · █ · █ · █ █ · ·
· █ · · · · · · · · █ ·
· █ · · · · · · · · █ ·
· █ · · · · · · · · █ · 
· █ · · · · · · · · █ ·
· █ █ █ █ █ █ █ █ █ █ ·
· · · · · · · · · · · ·
· · · · · · · · · · · ·
· █ █ █ █ █ █ █ · █ █
█ · · · · · · · █ █ █ █
█ · · · · · · · · · · █
█ · · · · · · · · █ · █ 
█ · · · · · · · · · · █
█ · · · · · · ··  █ · █ 
█ · · · · · · · · · · █
█ · · · · · · · █ █ █ █
· █ █ █ █ █ █ █ · █ █
· · · · · · · · · · · ·
· · · · · · · · · · · ·

· · · · · · · · · · · ·
· · · · █ █ █ █ · · · ·
· · · · █ · · █ · · · ·
█ █ █ █ █ █ █ █ █ █ █ █
█ █ █ █ █ █ █ █ █ █ █ █
█ █ █ █ █ · · █ █ █ █ █
█ · · · · · · · · · · █
█ █ █ █ █ █ █ █ █ █ █ █
█ █ █ █ █ █ █ █ █ █ █ █
█ █ █ █ █ █ █ █ █ █ █ █
█ █ █ █ █ █ █ █ █ █ █ █
· · · · · · · · · · · ·
· · · · · · · · · · · ·
█ █ █ █ █ █ █ █ █ █ █ █
█ █ █ █ █ █ █ █ █ █ █ █
█ █ · · · · · · · · █ █
█ █ · █ █ █ █ █ █ · █ █
█ █ · █ █ █ █ █ █ · █ █
█ █ · █ █ █ █ █ █ · █ █
█ █ · █ █ █ █ █ █ · █ █
█ █ · · · · · · · · █ █
█ █ █ █ █ █ █ █ █ █ █ █
█ █ █ █ █ █ █ · · █ █ █
█ █ █ █ █ █ █ █ █ █ █ █
· █ █ █ █ █ █ █ █ █ █ ·
*/