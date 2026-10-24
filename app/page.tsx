"use client";

import { useState } from "react";
import Link from "next/link";

// Public landing page served at "/" on the company's own server.
// The admin dashboard lives at /dashboard (login-gated). All styles are scoped
// under `.lp` so nothing leaks into the dashboard.
export default function Home() {
  const [menu, setMenu] = useState(false);
  const close = () => setMenu(false);
  const DOCS = "https://github.com/mnavas/taximeter/blob/main/docs";

  return (
    <div className="lp" id="top">
      <style>{CSS}</style>

      <nav>
        <div className="nav-inner">
          <a href="#top" className="nav-brand"><span className="brand-icon">🚕</span><span>Taximeter</span></a>
          <div className="nav-links">
            <a href="#features">Funciones</a>
            <a href="#how">Cómo funciona</a>
            <a href="#apps">Las apps</a>
            <a href="#install">Instalación</a>
            <a href={`${DOCS}/install.md`}>Documentación</a>
            <Link href="/dashboard" className="btn btn-primary">Panel</Link>
          </div>
          <button
            className={`nav-hamburger${menu ? " open" : ""}`}
            aria-label="Abrir menú"
            onClick={() => setMenu((m) => !m)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
        <div className={`nav-mobile${menu ? " open" : ""}`}>
          <a href="#features" onClick={close}>Funciones</a>
          <a href="#how" onClick={close}>Cómo funciona</a>
          <a href="#apps" onClick={close}>Las apps</a>
          <a href="#install" onClick={close}>Instalación</a>
          <a href={`${DOCS}/install.md`} onClick={close}>Documentación</a>
          <Link href="/dashboard" className="btn btn-primary" onClick={close}>Panel</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">🚕 Autoalojado · Código abierto · Sin comisiones</div>
        <h1>Despacho y taxímetro para <span className="highlight">tu empresa de taxis</span></h1>
        <p>Monitorea tu flota, guarda cada carrera y define tus propias tarifas — todo en tu propio servidor. Una instalación con Docker y listo.</p>
        <div className="hero-actions">
          <a href="#install" className="btn btn-primary">Instalar ahora</a>
          <a href={`${DOCS}/install.md`} className="btn btn-outline">Ver documentación</a>
        </div>
        <div className="hero-meta">
          <span>🖥️ Un servidor = una empresa</span>
          <span>💸 0% de comisión por carrera</span>
          <span>🔓 Servidor MIT, gratis</span>
        </div>
      </section>

      {/* FLOW STRIP */}
      <section className="flow-strip">
        <div className="flow-inner">
          <div className="flow-step"><div className="flow-icon">📲</div><div className="flow-label">El pasajero pide</div><div className="flow-sub">y ve cuántos taxis hay cerca</div></div>
          <div className="flow-arrow">→</div>
          <div className="flow-step"><div className="flow-icon">🚕</div><div className="flow-label">Un taxi acepta</div><div className="flow-sub">placa, foto, modelo, código</div></div>
          <div className="flow-arrow">→</div>
          <div className="flow-step"><div className="flow-icon">🧭</div><div className="flow-label">Sabe cuándo llega</div><div className="flow-sub">tiempo estimado del conductor</div></div>
          <div className="flow-arrow">→</div>
          <div className="flow-step"><div className="flow-icon">💵</div><div className="flow-label">Paga y califica</div><div className="flow-sub">efectivo o QR</div></div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="section-inner">
          <h2 className="section-title">Todo lo que tu central necesita</h2>
          <p className="section-sub">Una sola instalación te da el panel de la empresa y el taxímetro — con tus reglas y tus datos.</p>
          <div className="features-grid">
            <div className="feature-card"><span className="fc-icon">🗺️</span><h3>Monitoreo de flota</h3><p>Mira cada taxi en servicio en el mapa: su ruta actual y la hora de su última actualización. Detecta de un vistazo qué unidad perdió señal.</p></div>
            <div className="feature-card"><span className="fc-icon">🧾</span><h3>Historial por conductor</h3><p>Cada carrera queda guardada: distancia, horas, tarifa aplicada y tier usado. Revisa cuánto trabajó y ganó cada conductor por rango de fechas.</p></div>
            <div className="feature-card"><span className="fc-icon">⚙️</span><h3>Tarifas que tú controlas</h3><p>Tú fijas cada monto: banderazo, por km, espera, recargos y tarifa mínima — por cada tier (Económico, SUV, Lujo…).</p></div>
            <div className="feature-card"><span className="fc-icon">🕑</span><h3>Reglas por horario</h3><p>Haz que un tier solo esté disponible de noche, o aplica un recargo nocturno automático. El conductor ve el tier correcto según la hora.</p></div>
            <div className="feature-card"><span className="fc-icon">📟</span><h3>Taxímetro integrado</h3><p>La app del conductor calcula la tarifa en vivo con tu configuración — y funciona sin conexión, sincronizando al reconectar.</p></div>
            <div className="feature-card"><span className="fc-icon">🛡️</span><h3>Confianza y marcas</h3><p>Califica pasajeros y márcalos por no pago o no presentarse. La marca sigue a la cuenta, el dispositivo y el correo del infractor.</p></div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section alt" id="how">
        <div className="section-inner">
          <h2 className="section-title">Cómo funciona una carrera</h2>
          <p className="section-sub">Simple para el pasajero, con todo el control para la empresa.</p>
          <div className="steps-row">
            <div className="step-box"><div className="sb-num">1</div><h3>Pide un taxi</h3><p>El pasajero ve <strong>cuántos taxis hay cerca</strong> y cuántos libres — nunca el mapa de las unidades. Pide su carrera.</p></div>
            <div className="step-box"><div className="sb-num">2</div><h3>Un conductor acepta</h3><p>Al pasajero le llega la <strong>placa, la foto y el nombre del conductor</strong>, el color y modelo del auto, y un <strong>código de verificación</strong>.</p></div>
            <div className="step-box"><div className="sb-num">3</div><h3>Sabe cuándo llega</h3><p>Al aceptar, el conductor <strong>declara su tiempo de llegada</strong>. El pasajero ve una cuenta regresiva — y la central compara lo prometido con lo real.</p></div>
            <div className="step-box"><div className="sb-num">4</div><h3>Paga y califica</h3><p>Al terminar, paga en <strong>efectivo o QR</strong> (DeUna, Produbanco…) y comparte el comprobante a la carrera.</p></div>
          </div>
        </div>
      </section>

      {/* TWO APPS */}
      <section className="section" id="apps">
        <div className="section-inner">
          <h2 className="section-title">Dos apps, una central</h2>
          <p className="section-sub">Las apps se vinculan a tu servidor escaneando un código QR. Nada de nube compartida.</p>
          <div className="apps-grid">
            <div className="app-card">
              <div className="ac-head"><span className="ac-icon">🚗</span><h3>App del conductor</h3></div>
              <ul>
                <li>Recibe y acepta solicitudes de carrera</li>
                <li>Elige el tier (automático según la hora, con opción de cambiarlo)</li>
                <li>Confirma al pasajero con un código, si lo desea</li>
                <li>Taxímetro en vivo con tus tarifas, incluso sin señal</li>
                <li>Cobra en efectivo o mostrando su QR</li>
              </ul>
            </div>
            <div className="app-card">
              <div className="ac-head"><span className="ac-icon">📱</span><h3>App del pasajero</h3></div>
              <ul>
                <li>Ve cuántos taxis hay cerca y cuántos libres</li>
                <li>Pide una carrera y elige el tier</li>
                <li>Recibe los datos del taxi y el código de verificación</li>
                <li>Ve el tiempo estimado de llegada (que declara el conductor)</li>
                <li>Paga por QR y comparte el comprobante</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* INSTALL */}
      <section className="section alt" id="install">
        <div className="section-inner deploy-card">
          <h2 className="section-title">Funcionando en tu servidor en minutos</h2>
          <p className="section-sub">Clona el repositorio y ejecuta un comando. El asistente te pregunta la URL, el nombre de la empresa y tu cuenta de administrador, y hace el resto.</p>
          <div className="code-wrap">
            <pre>{`# Descarga Taximeter
git clone https://github.com/mnavas/taximeter
cd taximeter

# Instálalo (descarga Docker si hace falta)
./taximeter install`}</pre>
          </div>
          <p className="deploy-note">Al terminar entras al panel en <code>http://tu-servidor:3000/dashboard</code>. Guía completa en la <a href={`${DOCS}/install.md`}>documentación de instalación</a>.</p>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section" id="services">
        <div className="section-inner">
          <div className="services-card">
            <h2>¿Prefieres que te lo instalemos?</h2>
            <p>El servidor es gratis y de código abierto. Si no quieres administrarlo tú, nosotros lo ponemos a andar y te damos las apps con la marca de tu empresa.</p>
            <div className="services-list">
              <div className="svc"><h4>🚀 Instalación y hospedaje</h4><p>Montamos, configuramos y mantenemos tu servidor por ti.</p></div>
              <div className="svc"><h4>🎨 Apps personalizadas</h4><p>Apps de conductor y pasajero con el nombre, colores y publicación de tu empresa.</p></div>
              <div className="svc"><h4>🧭 Acompañamiento</h4><p>Te ayudamos a configurar tarifas, tiers y tu flota.</p></div>
            </div>
            <a href="mailto:warionv@gmail.com?subject=Taximeter" className="btn btn-primary">Escríbenos</a>
          </div>
        </div>
      </section>

      {/* OPEN SOURCE */}
      <section className="section alt" id="opensource">
        <div className="section-inner os-inner">
          <h2 className="section-title">Servidor gratis y de código abierto</h2>
          <p>La plataforma del servidor es <strong>código abierto con licencia MIT</strong>: úsala, modifícala y aloja tu propia central sin costo. Las apps de conductor y pasajero son gratis de usar; su código es comercial y se ofrece con planes pagados. <strong>Nunca cobramos comisión por carrera.</strong></p>
          <a href="https://github.com/mnavas/taximeter" className="btn btn-outline">Ver en GitHub</a>
        </div>
      </section>

      <footer>
        <div className="footer-brand"><span className="brand-icon">🚕</span><span>Taximeter</span></div>
        <p>Despacho, taxímetro y monitoreo de flota, autoalojado.</p>
        <p>Hecho con ❤ para empresas de taxis. Servidor bajo licencia MIT.</p>
        <div className="footer-nav">
          <a href="#features">Funciones</a>
          <a href={`${DOCS}/install.md`}>Instalación</a>
          <a href={`${DOCS}/daily-use.md`}>Uso diario</a>
          <a href={`${DOCS}/fleet-and-fares.md`}>Flota y tarifas</a>
          <a href={`${DOCS}/admin.md`}>Administración</a>
          <a href="https://github.com/mnavas/taximeter">GitHub</a>
        </div>
      </footer>
    </div>
  );
}

const CSS = `
.lp { --yellow:#F5B301; --yellow-dark:#C98E00; --yellow-pale:#FEF6DC; --ink:#1A1403;
  --gray-50:#F9FAFB; --gray-100:#F3F4F6; --gray-200:#E5E7EB; --gray-300:#D1D5DB; --gray-400:#9CA3AF;
  --gray-600:#4B5563; --gray-700:#374151; --gray-800:#1F2937; --gray-900:#111827; --white:#fff; --radius:12px;
  background:var(--white); color:var(--gray-800); line-height:1.6; min-height:100vh;
  font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif; }
.lp *, .lp *::before, .lp *::after { box-sizing:border-box; margin:0; padding:0; }
.lp h1,.lp h2,.lp h3,.lp h4 { color:var(--gray-900); line-height:1.2; }
.lp a { color:inherit; }
.lp nav { position:sticky; top:0; z-index:100; background:rgba(255,255,255,.95); backdrop-filter:blur(8px); border-bottom:1px solid var(--gray-200); }
.lp .nav-inner { padding:0 2rem; height:60px; display:flex; align-items:center; justify-content:space-between; }
.lp .nav-brand { display:flex; align-items:center; gap:10px; text-decoration:none; flex-shrink:0; }
.lp .nav-brand .brand-icon { font-size:1.5rem; line-height:1; }
.lp .nav-brand span { font-size:1.15rem; font-weight:800; color:var(--gray-900); }
.lp .nav-links { display:flex; align-items:center; gap:2rem; }
.lp .nav-links a { text-decoration:none; font-size:.875rem; font-weight:500; color:var(--gray-600); transition:color .15s; }
.lp .nav-links a:hover { color:var(--gray-900); }
.lp .nav-hamburger { display:none; background:none; border:none; cursor:pointer; padding:6px; color:var(--gray-800); flex-direction:column; gap:5px; align-items:center; justify-content:center; }
.lp .nav-hamburger span { display:block; width:22px; height:2px; background:currentColor; border-radius:2px; transition:transform .2s,opacity .2s; }
.lp .nav-hamburger.open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
.lp .nav-hamburger.open span:nth-child(2) { opacity:0; }
.lp .nav-hamburger.open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
.lp .nav-mobile { display:none; flex-direction:column; background:var(--white); border-top:1px solid var(--gray-200); padding:1rem 1.5rem 1.25rem; }
.lp .nav-mobile.open { display:flex; }
.lp .nav-mobile a { text-decoration:none; font-size:.95rem; font-weight:500; color:var(--gray-700); padding:.7rem 0; border-bottom:1px solid var(--gray-100); }
.lp .nav-mobile a:last-of-type { border-bottom:none; }
.lp .nav-mobile .btn { margin-top:.75rem; justify-content:center; width:100%; }
.lp .btn { display:inline-flex; align-items:center; gap:6px; padding:.5rem 1.25rem; border-radius:8px; font-size:.875rem; font-weight:700; text-decoration:none; transition:all .15s; border:none; cursor:pointer; }
.lp .btn-primary { background:var(--yellow); color:var(--ink); }
.lp .btn-primary:hover { background:var(--yellow-dark); }
.lp .btn-outline { background:transparent; color:var(--gray-800); border:1.5px solid var(--gray-200); }
.lp .btn-outline:hover { border-color:var(--yellow-dark); color:var(--yellow-dark); }
.lp .hero { background:linear-gradient(160deg,var(--yellow-pale) 0%,var(--white) 60%); padding:6rem 2rem 5rem; text-align:center; }
.lp .hero-badge { display:inline-flex; align-items:center; gap:6px; background:var(--yellow-pale); border:1px solid #F5B30160; color:var(--yellow-dark); font-size:.8rem; font-weight:700; padding:4px 12px; border-radius:999px; margin-bottom:1.5rem; }
.lp .hero h1 { font-size:clamp(2rem,5vw,3.25rem); font-weight:800; line-height:1.15; color:var(--gray-900); max-width:760px; margin:0 auto 1.25rem; }
.lp .hero h1 .highlight { color:var(--yellow-dark); }
.lp .hero p { font-size:1.125rem; color:var(--gray-600); max-width:600px; margin:0 auto 2.5rem; }
.lp .hero-actions { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; }
.lp .hero-actions .btn { padding:.75rem 1.75rem; font-size:1rem; }
.lp .hero-meta { margin-top:3rem; font-size:.8rem; color:var(--gray-400); display:flex; justify-content:center; gap:1.5rem; flex-wrap:wrap; }
.lp .hero-meta span { display:flex; align-items:center; gap:4px; }
.lp .flow-strip { background:var(--gray-900); padding:2.5rem 2rem; }
.lp .flow-inner { max-width:920px; margin:0 auto; display:flex; align-items:center; justify-content:center; flex-wrap:wrap; }
.lp .flow-step { display:flex; flex-direction:column; align-items:center; gap:.5rem; text-align:center; padding:.75rem 1.25rem; }
.lp .flow-step .flow-icon { font-size:1.5rem; }
.lp .flow-step .flow-label { font-size:.75rem; font-weight:700; color:#fff; line-height:1.3; }
.lp .flow-step .flow-sub { font-size:.7rem; color:var(--gray-400); }
.lp .flow-arrow { color:var(--yellow); font-size:1.25rem; padding:0 .25rem; }
.lp .section { padding:5rem 2rem; }
.lp .section.alt { background:var(--gray-50); }
.lp .section-inner { max-width:1100px; margin:0 auto; }
.lp .section-title { font-size:clamp(1.6rem,3.5vw,2.4rem); font-weight:800; color:var(--gray-900); text-align:center; line-height:1.2; margin-bottom:.75rem; }
.lp .section-sub { font-size:1.05rem; color:var(--gray-600); text-align:center; max-width:620px; margin:0 auto 3rem; }
.lp .features-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:1.5rem; }
.lp .feature-card { background:var(--white); border:1px solid var(--gray-200); border-radius:var(--radius); padding:1.75rem; }
.lp .feature-card .fc-icon { font-size:1.75rem; margin-bottom:.9rem; display:inline-block; }
.lp .feature-card h3 { font-size:1.05rem; font-weight:700; color:var(--gray-900); margin-bottom:.5rem; }
.lp .feature-card p { font-size:.9rem; color:var(--gray-600); line-height:1.65; }
.lp .steps-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1.25rem; }
.lp .step-box { background:var(--gray-50); border:1px solid var(--gray-200); border-radius:var(--radius); padding:1.5rem; }
.lp .step-box .sb-num { width:30px; height:30px; border-radius:50%; background:var(--yellow); color:var(--ink); font-weight:800; font-size:.8rem; display:flex; align-items:center; justify-content:center; margin-bottom:.9rem; }
.lp .step-box h3 { font-size:.95rem; font-weight:700; color:var(--gray-900); margin-bottom:.4rem; }
.lp .step-box p { font-size:.86rem; color:var(--gray-600); line-height:1.6; }
.lp .apps-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:1.5rem; }
.lp .app-card { border:1px solid var(--gray-200); border-radius:var(--radius); padding:2rem; background:var(--white); }
.lp .app-card .ac-head { display:flex; align-items:center; gap:.75rem; margin-bottom:1rem; }
.lp .app-card .ac-icon { font-size:1.75rem; }
.lp .app-card h3 { font-size:1.15rem; font-weight:800; color:var(--gray-900); }
.lp .app-card ul { list-style:none; display:grid; gap:.6rem; }
.lp .app-card li { font-size:.9rem; color:var(--gray-700); padding-left:1.5rem; position:relative; line-height:1.5; }
.lp .app-card li::before { content:"✓"; position:absolute; left:0; color:var(--yellow-dark); font-weight:800; }
.lp .deploy-card { max-width:720px; margin:0 auto; }
.lp .code-wrap { background:#0D1117; border:1px solid #30363D; border-radius:var(--radius); padding:1.5rem; overflow-x:auto; }
.lp .code-wrap pre { font-family:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.85rem; line-height:1.8; color:#E6EDF3; white-space:pre; }
.lp .deploy-note { text-align:center; font-size:.9rem; color:var(--gray-600); margin-top:1.5rem; }
.lp .deploy-note a { color:var(--yellow-dark); font-weight:700; }
.lp .services-card { max-width:760px; margin:0 auto; background:linear-gradient(160deg,var(--yellow-pale) 0%,var(--white) 70%); border:1px solid #F5B30140; border-radius:var(--radius); padding:2.5rem; text-align:center; }
.lp .services-card h2 { font-size:1.6rem; font-weight:800; color:var(--gray-900); margin-bottom:.75rem; }
.lp .services-card p { font-size:1rem; color:var(--gray-600); max-width:560px; margin:0 auto 1.5rem; }
.lp .services-list { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; margin:1.75rem 0; text-align:left; }
.lp .svc { background:var(--white); border:1px solid var(--gray-200); border-radius:10px; padding:1.1rem; }
.lp .svc h4 { font-size:.9rem; font-weight:700; margin-bottom:.35rem; }
.lp .svc p { font-size:.82rem; color:var(--gray-600); margin:0; }
.lp .os-inner { max-width:720px; margin:0 auto; text-align:center; }
.lp .os-inner p { font-size:1rem; color:var(--gray-600); max-width:600px; margin:0 auto 1.5rem; }
.lp footer { background:var(--gray-900); padding:3rem 2rem; text-align:center; }
.lp footer .footer-brand { display:flex; align-items:center; gap:10px; justify-content:center; margin-bottom:.75rem; }
.lp footer .footer-brand .brand-icon { font-size:1.5rem; }
.lp footer .footer-brand span { font-size:1rem; font-weight:800; color:#fff; }
.lp footer p { font-size:.8rem; color:var(--gray-400); margin-top:.4rem; }
.lp footer .footer-nav { margin-top:1.5rem; display:flex; gap:1.5rem; justify-content:center; flex-wrap:wrap; }
.lp footer .footer-nav a { font-size:.8rem; color:var(--gray-400); text-decoration:none; }
.lp footer .footer-nav a:hover { color:#fff; }
@media (max-width:768px) {
  .lp .nav-inner { padding:0 1.25rem; } .lp .nav-links { display:none; } .lp .nav-hamburger { display:flex; }
  .lp .section { padding:3.5rem 1.25rem; } .lp .hero { padding:4rem 1.25rem 3rem; }
  .lp .flow-arrow { transform:rotate(90deg); }
}
`;
