import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de Cookies | Lumio",
  description: "Politica de cookies de Lumio. Que cookies usamos y por que.",
};

export default function CookiePolicyPage() {
  return (
    <article className="legal-article">
      <header className="legal-header">
        <p className="legal-label">Ultima actualizacion: 18 de mayo de 2026</p>
        <h1 className="legal-title">Politica de Cookies</h1>
        <p className="legal-subtitle">
          Lumio utiliza exclusivamente cookies tecnicas esenciales para el funcionamiento
          de la aplicacion. No usamos cookies publicitarias ni de seguimiento.
        </p>
      </header>

      <section className="legal-section">
        <h2>1. Que son las cookies</h2>
        <p>
          Las cookies son pequenos archivos de texto que los sitios web almacenan en tu
          navegador. Se utilizan para recordar preferencias, mantener sesiones activas y
          mejorar la experiencia del usuario.
        </p>
      </section>

      <section className="legal-section">
        <h2>2. Cookies que utilizamos</h2>
        <p>
          Lumio solo utiliza cookies <strong>estrictamente necesarias</strong> para el
          funcionamiento del servicio. No requieren consentimiento segun el GDPR porque
          son esenciales para prestar el servicio que has solicitado.
        </p>
        <table className="legal-table">
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Proposito</th>
              <th>Duracion</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>next-auth.session-token</td>
              <td>Mantener tu sesion activa tras iniciar sesion</td>
              <td>7 dias (renovable)</td>
              <td>Esencial</td>
            </tr>
            <tr>
              <td>next-auth.csrf-token</td>
              <td>Proteccion contra ataques CSRF (falsificacion de solicitudes)</td>
              <td>Sesion</td>
              <td>Seguridad</td>
            </tr>
            <tr>
              <td>next-auth.callback-url</td>
              <td>Recordar la pagina de destino tras autenticarte</td>
              <td>Sesion</td>
              <td>Esencial</td>
            </tr>
            <tr>
              <td>__vercel_live_token</td>
              <td>Solo en desarrollo &mdash; no presente en produccion</td>
              <td>Sesion</td>
              <td>Desarrollo</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="legal-section">
        <h2>3. Cookies que NO utilizamos</h2>
        <p>Lumio <strong>no utiliza</strong>:</p>
        <ul>
          <li>Cookies de publicidad o remarketing (Google Ads, Meta Pixel, etc.).</li>
          <li>Cookies de analitica (Google Analytics, Mixpanel, etc.).</li>
          <li>Cookies de seguimiento entre sitios (third-party tracking).</li>
          <li>Cookies de redes sociales.</li>
        </ul>
        <p>
          Por este motivo, no necesitas un banner de consentimiento de cookies para usar Lumio,
          ya que todas nuestras cookies son estrictamente necesarias y estan exentas del
          requisito de consentimiento segun el Art. 5.3 de la Directiva ePrivacy.
        </p>
      </section>

      <section className="legal-section">
        <h2>4. Almacenamiento local (localStorage)</h2>
        <p>
          Ademas de cookies, Lumio puede utilizar el almacenamiento local del navegador
          (localStorage) para guardar preferencias de interfaz como el estado del sidebar.
          Estos datos no se envian a ningun servidor y permanecen exclusivamente en tu
          dispositivo.
        </p>
      </section>

      <section className="legal-section">
        <h2>5. Como gestionar las cookies</h2>
        <p>
          Puedes configurar tu navegador para bloquear o eliminar cookies. Sin embargo,
          si bloqueas las cookies esenciales de Lumio, no podras iniciar sesion ni usar
          la aplicacion.
        </p>
        <p>Instrucciones por navegador:</p>
        <ul>
          <li><strong>Chrome:</strong> Configuracion &gt; Privacidad y seguridad &gt; Cookies</li>
          <li><strong>Firefox:</strong> Preferencias &gt; Privacidad &gt; Cookies</li>
          <li><strong>Safari:</strong> Preferencias &gt; Privacidad</li>
          <li><strong>Edge:</strong> Configuracion &gt; Privacidad &gt; Cookies</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>6. Cambios en esta politica</h2>
        <p>
          Si en el futuro introducimos cookies no esenciales (por ejemplo, analitica),
          actualizaremos esta politica e implementaremos un mecanismo de consentimiento
          previo conforme al GDPR.
        </p>
      </section>

      <section className="legal-section">
        <h2>7. Contacto</h2>
        <p>
          Para preguntas sobre cookies:{" "}
          <a href="mailto:privacidad@lumio.app">privacidad@lumio.app</a>
        </p>
      </section>
    </article>
  );
}
