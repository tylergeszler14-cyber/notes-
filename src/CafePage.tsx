import React from 'react';

const TEAL = '#1A7A6E';
const GOLD = '#C4922A';
const ESPRESSO = '#16100A';
const CREAM = '#FDF6EE';
const LINEN = '#F0E4D0';
const MUTED = '#7A6552';

function StarRow({ count = 5 }: { count?: number }) {
  return (
    <span style={{ color: GOLD, fontSize: '1.1rem', letterSpacing: '0.05em' }}>
      {'★'.repeat(count)}
    </span>
  );
}

function Divider({ light = false }: { light?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      margin: '2rem auto',
      maxWidth: '280px'
    }}>
      <div style={{ flex: 1, height: '1px', backgroundColor: light ? 'rgba(253,246,238,0.2)' : 'rgba(22,16,10,0.15)' }} />
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: GOLD, transform: 'rotate(45deg)' }} />
      <div style={{ flex: 1, height: '1px', backgroundColor: light ? 'rgba(253,246,238,0.2)' : 'rgba(22,16,10,0.15)' }} />
    </div>
  );
}

const menuItems = [
  { name: 'Almond Croissant', price: '$6.50', note: 'House favourite' },
  { name: 'Chocolate Croissant', price: '$5.30', note: 'Fresh & airy' },
  { name: 'Butter Croissant', price: '$4.80', note: 'Classic' },
  { name: 'Palmier', price: '$4.65', note: 'Crisp & buttery' },
  { name: 'Tiramisu', price: '—', note: 'Chef\'s special' },
  { name: 'Cheese Scone', price: '$4.00', note: 'Baked fresh' },
  { name: 'Assorted Muffins', price: '$4.25', note: 'Blueberry · Vanilla · Cranberry' },
  { name: 'Macarons', price: '—', note: 'Seasonal flavours' },
];

const drinkItems = [
  { name: 'Mocha Frappé', price: '—', note: 'Crowd pleaser' },
  { name: 'Americano', price: '—', note: 'Smooth & bold' },
  { name: 'Latte', price: '—', note: 'Lavender available' },
  { name: 'Fresh Juice', price: '$4.00', note: 'Daily selection' },
];

export default function CafePage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: CREAM, color: ESPRESSO, lineHeight: 1.6 }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{
        backgroundColor: ESPRESSO,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          background: `radial-gradient(circle, ${TEAL}22 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '20%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: `radial-gradient(circle, ${GOLD}18 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          border: `1px solid ${GOLD}55`,
          borderRadius: '999px',
          padding: '0.35rem 1.1rem',
          marginBottom: '2.5rem',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: GOLD,
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80', display: 'inline-block' }} />
          Open Today · Closes 7 PM
        </div>

        {/* Name */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(3rem, 8vw, 6.5rem)',
          fontWeight: 700,
          fontStyle: 'italic',
          color: CREAM,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          marginBottom: '0.5rem',
        }}>
          First Light
        </h1>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.4rem, 4vw, 2.8rem)',
          fontWeight: 400,
          color: GOLD,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '1.5rem',
        }}>
          Bakery &amp; Café
        </h2>

        <Divider light />

        <p style={{ color: 'rgba(253,246,238,0.55)', fontSize: '0.95rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Tsawwassen Mills · Delta, BC
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: GOLD }}>
          <StarRow />
          <span style={{ color: 'rgba(253,246,238,0.6)', fontSize: '0.85rem', marginLeft: '0.25rem' }}>4.7 · 126 reviews</span>
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a
            href="tel:6043821133"
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '999px',
              backgroundColor: TEAL,
              color: CREAM,
              fontWeight: 700,
              fontSize: '0.875rem',
              letterSpacing: '0.05em',
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Call Us
          </a>
          <a
            href="https://www.instagram.com/firstlightbakerycafe/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '999px',
              backgroundColor: 'transparent',
              color: CREAM,
              fontWeight: 700,
              fontSize: '0.875rem',
              letterSpacing: '0.05em',
              textDecoration: 'none',
              border: `1px solid rgba(253,246,238,0.25)`,
              cursor: 'pointer',
            }}
          >
            @firstlightbakerycafe
          </a>
        </div>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', opacity: 0.35 }}>
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: CREAM }}>Scroll</span>
          <div style={{ width: '1px', height: '40px', background: `linear-gradient(to bottom, ${CREAM}, transparent)` }} />
        </div>
      </section>

      {/* ── INFO BAR ─────────────────────────────────────────── */}
      <section style={{ backgroundColor: TEAL, color: CREAM, padding: '3rem 2rem' }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2.5rem', textAlign: 'center',
        }}>
          {[
            { label: 'Find Us', value: '#206 – 5000 Canoe Pass Way', sub: 'Floor 1 · Tsawwassen Mills, Delta BC' },
            { label: 'Hours', value: 'Open Daily', sub: 'Until 7:00 PM' },
            { label: 'Call', value: '(604) 382-1133', sub: 'We\'d love to hear from you' },
          ].map(({ label, value, sub }) => (
            <div key={label}>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.65, marginBottom: '0.5rem' }}>{label}</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, fontStyle: 'italic', marginBottom: '0.25rem' }}>{value}</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────── */}
      <section style={{ padding: '6rem 2rem', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: TEAL, marginBottom: '1rem' }}>Our Story</p>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, fontStyle: 'italic', lineHeight: 1.2, marginBottom: '1.5rem' }}>
          A quiet corner worth finding
        </h3>
        <p style={{ fontSize: '1rem', color: MUTED, maxWidth: '560px', margin: '0 auto', lineHeight: 1.8 }}>
          Tucked inside Tsawwassen Mills, First Light is a calm refuge from the mall hustle — a place
          where fresh-baked croissants meet excellent espresso and every bite feels intentional.
          Spacious, warm, and genuinely quiet. Once you find us, you'll keep coming back.
        </p>
        <Divider />
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          {[['$1–$10', 'Accessible pricing'], ['4.7 ★', 'Google rating'], ['126+', 'Happy guests']].map(([val, lab]) => (
            <div key={lab} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: ESPRESSO }}>{val}</p>
              <p style={{ fontSize: '0.75rem', color: MUTED, letterSpacing: '0.08em' }}>{lab}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MENU HIGHLIGHTS ──────────────────────────────────── */}
      <section style={{ backgroundColor: ESPRESSO, padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: '0.75rem' }}>From the Case</p>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 700, fontStyle: 'italic', color: CREAM }}>
              Baked fresh, every day
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
            {/* Baked Goods column */}
            <div style={{ backgroundColor: '#1E140C', borderRadius: '16px', padding: '2rem', border: '1px solid rgba(196,146,42,0.15)' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: '1.5rem' }}>Baked Goods</p>
              {menuItems.map(({ name, price, note }) => (
                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.1rem', paddingBottom: '1.1rem', borderBottom: '1px solid rgba(253,246,238,0.06)' }}>
                  <div>
                    <p style={{ color: CREAM, fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.1rem' }}>{name}</p>
                    <p style={{ color: 'rgba(253,246,238,0.4)', fontSize: '0.75rem' }}>{note}</p>
                  </div>
                  <span style={{ color: GOLD, fontWeight: 700, fontSize: '0.9rem', marginLeft: '1rem', whiteSpace: 'nowrap' }}>{price}</span>
                </div>
              ))}
            </div>

            {/* Drinks column */}
            <div style={{ backgroundColor: '#1E140C', borderRadius: '16px', padding: '2rem', border: '1px solid rgba(196,146,42,0.15)' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: '1.5rem' }}>Drinks</p>
              {drinkItems.map(({ name, price, note }) => (
                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.1rem', paddingBottom: '1.1rem', borderBottom: '1px solid rgba(253,246,238,0.06)' }}>
                  <div>
                    <p style={{ color: CREAM, fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.1rem' }}>{name}</p>
                    <p style={{ color: 'rgba(253,246,238,0.4)', fontSize: '0.75rem' }}>{note}</p>
                  </div>
                  <span style={{ color: GOLD, fontWeight: 700, fontSize: '0.9rem', marginLeft: '1rem', whiteSpace: 'nowrap' }}>{price}</span>
                </div>
              ))}
              {/* Wraps */}
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: '1rem', marginTop: '1.5rem' }}>Wraps</p>
              {['Thai Chicken', 'Breakfast', 'Vegan'].map((w) => (
                <div key={w} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <p style={{ color: CREAM, fontSize: '0.9rem' }}>{w}</p>
                  <span style={{ color: 'rgba(253,246,238,0.35)', fontSize: '0.8rem' }}>Ask in-store</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', color: 'rgba(253,246,238,0.35)', fontSize: '0.8rem' }}>
            Menu items and availability may vary daily. Visit us to see what's fresh.
          </p>
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────────────────────── */}
      <section style={{ padding: '6rem 2rem', backgroundColor: LINEN }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: TEAL, marginBottom: '0.75rem' }}>Guest Reviews</p>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 700, fontStyle: 'italic', color: ESPRESSO }}>
              What our guests are saying
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                name: 'Angel Lucero',
                tag: 'Local Guide',
                text: '"So good and quiet atmosphere compared to Starbucks on the other side. You guys are sleeping on this place!! The chocolate croissant was fresh, airy, crunchy and warm — a sweet surprise. Mocha frappé was great and the americano hit the spot. Will be coming around again!"',
                detail: 'Food · Service · Atmosphere: 5/5',
              },
              {
                name: 'Yulia Herasimovich',
                tag: '7 café reviews',
                text: '"The coffee was excellent, and the palmier was absolutely delicious — crisp, buttery, and memorable. The place itself is spacious, calm, and pleasantly quiet. What I tried was of very good quality."',
                detail: 'Food · Service · Atmosphere: 5/5',
              },
            ].map(({ name, tag, text, detail }) => (
              <div key={name} style={{
                backgroundColor: CREAM, borderRadius: '16px',
                padding: '2rem', boxShadow: '0 2px 20px rgba(22,16,10,0.07)',
                border: '1px solid rgba(22,16,10,0.06)',
              }}>
                <StarRow />
                <p style={{ marginTop: '1rem', marginBottom: '1.5rem', fontSize: '0.95rem', color: '#3D2B1A', lineHeight: 1.7, fontStyle: 'italic' }}>{text}</p>
                <div style={{ borderTop: '1px solid rgba(22,16,10,0.08)', paddingTop: '1rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: ESPRESSO }}>{name}</p>
                  <p style={{ fontSize: '0.75rem', color: MUTED }}>{tag}</p>
                  <p style={{ fontSize: '0.7rem', color: TEAL, marginTop: '0.5rem', fontWeight: 600 }}>{detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <a
              href="https://maps.app.goo.gl/pjZWVCgDGzEWzwAP6"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: TEAL, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', borderBottom: `1px solid ${TEAL}55`, paddingBottom: '2px' }}
            >
              Read all 126 reviews on Google →
            </a>
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM CTA ────────────────────────────────────── */}
      <section style={{
        backgroundColor: ESPRESSO, padding: '6rem 2rem', textAlign: 'center',
        background: `linear-gradient(135deg, ${ESPRESSO} 0%, #2A1A0E 100%)`,
      }}>
        <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: '1rem' }}>Stay Connected</p>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, fontStyle: 'italic', color: CREAM, marginBottom: '0.5rem' }}>
          Follow along
        </h3>
        <p style={{ color: 'rgba(253,246,238,0.5)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
          Daily specials, behind-the-scenes baking, and café moments.
        </p>
        <a
          href="https://www.instagram.com/firstlightbakerycafe/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            padding: '1rem 2.5rem', borderRadius: '999px',
            backgroundColor: GOLD, color: ESPRESSO,
            fontWeight: 800, fontSize: '1rem', textDecoration: 'none',
            letterSpacing: '0.03em',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
          </svg>
          @firstlightbakerycafe
        </a>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ backgroundColor: '#0E0A06', color: 'rgba(253,246,238,0.5)', padding: '3rem 2rem', textAlign: 'center' }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1.3rem', color: CREAM, marginBottom: '1rem' }}>First Light Bakery &amp; Café</p>
        <p style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}>#206 – 5000 Canoe Pass Way, Delta, BC V4M 4G8</p>
        <p style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}>Floor 1 · Tsawwassen Mills</p>
        <p style={{ fontSize: '0.8rem', marginBottom: '1.5rem' }}>
          <a href="tel:6043821133" style={{ color: 'rgba(253,246,238,0.5)', textDecoration: 'none' }}>(604) 382-1133</a>
          {' · '}
          <a href="https://www.firstlightbakerycafe.com" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(253,246,238,0.5)', textDecoration: 'none' }}>firstlightbakerycafe.com</a>
        </p>
        <p style={{ fontSize: '0.7rem', opacity: 0.4 }}>© {new Date().getFullYear()} First Light Bakery &amp; Café</p>
      </footer>
    </div>
  );
}
