import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de Privacidad | Lumio",
  description: "Politica de privacidad de Lumio. Como recopilamos, usamos y protegemos tus datos.",
};

export default function PrivacyPolicyPage() {
  return (
    <article className="legal-article">
      <header className="legal-header">
        <p className="legal-label">Ultima actualizacion: 18 de mayo de 2026</p>
        <h1 className="legal-title">Politica de Privacidad</h1>
        <p className="legal-subtitle">
          En Lumio nos tomamos tu privacidad muy en serio. Este documento explica de
          forma transparente que datos recopilamos, por que y como los protegemos.
        </p>
      </header>

      <section className="legal-section">
        <h2>1. Responsable del tratamiento</h2>
        <p>
          Lumio es una aplicacion de productividad y nutricion personal. El responsable
          del tratamiento de tus datos es el equipo de Lumio. Para cualquier consulta
          relacionada con la privacidad, puedes escribirnos a:{" "}
          <a href="mailto:privacidad@lumio.app">privacidad@lumio.app</a>.
        </p>
      </section>

      <section className="legal-section">
        <h2>2. Datos que recopilamos</h2>

        <h3>2.1 Datos de cuenta</h3>
        <ul>
          <li><strong>Email:</strong> para autenticacion y comunicaciones esenciales del servicio.</li>
          <li><strong>Nombre y foto de perfil:</strong> solo si inicias sesion con Google OAuth.</li>
        </ul>

        <h3>2.2 Datos de salud y bienestar</h3>
        <ul>
          <li><strong>Perfil nutricional:</strong> peso, altura, edad, objetivo y nivel de actividad.</li>
          <li><strong>Registro alimentario:</strong> comidas, calorias, macronutrientes, fotos de alimentos.</li>
          <li><strong>Registro de peso e hidratacion:</strong> historial de peso y consumo de agua.</li>
        </ul>

        <h3>2.3 Datos de productividad</h3>
        <ul>
          <li><strong>Habitos:</strong> nombre, categoria, registros de cumplimiento.</li>
          <li><strong>Tareas:</strong> titulo, prioridad, estado, etiquetas.</li>
          <li><strong>Objetivos:</strong> titulo, plazo, hitos, progreso.</li>
          <li><strong>Diario personal:</strong> titulo, contenido, estado de animo, etiquetas.</li>
          <li><strong>Calendario:</strong> eventos con fecha y hora.</li>
        </ul>

        <h3>2.4 Datos tecnicos</h3>
        <ul>
          <li><strong>Direccion IP:</strong> para limitar tasas de peticion (rate limiting) y seguridad.</li>
          <li><strong>Cookies de sesion:</strong> para mantener tu sesion activa (ver Politica de Cookies).</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>3. Base legal del tratamiento (GDPR)</h2>
        <ul>
          <li><strong>Ejecucion del contrato (Art. 6.1.b):</strong> procesamos tus datos para prestarte el servicio que has solicitado al crear tu cuenta.</li>
          <li><strong>Interes legitimo (Art. 6.1.f):</strong> para seguridad, prevencion de fraude y mejora del servicio.</li>
          <li><strong>Consentimiento (Art. 6.1.a):</strong> para cualquier comunicacion no esencial (si aplicase en el futuro).</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>4. Servicios de terceros</h2>
        <p>
          Lumio <strong>no vende, alquila ni comparte</strong> tus datos personales con fines
          publicitarios. No usamos Google Analytics, Meta Pixel ni ningun tracker publicitario.
        </p>
        <p>Utilizamos los siguientes servicios exclusivamente para operar la aplicacion:</p>
        <table className="legal-table">
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Proposito</th>
              <th>Datos compartidos</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Supabase (AWS EU-WEST-1)</td>
              <td>Base de datos PostgreSQL</td>
              <td>Todos los datos de tu cuenta (cifrados en reposo)</td>
            </tr>
            <tr>
              <td>Vercel</td>
              <td>Hosting de la aplicacion</td>
              <td>Direccion IP, User-Agent (logs de acceso)</td>
            </tr>
            <tr>
              <td>Google OAuth</td>
              <td>Inicio de sesion con Google</td>
              <td>Email, nombre, foto de perfil (solo si eliges esta opcion)</td>
            </tr>
            <tr>
              <td>Resend</td>
              <td>Envio de emails transaccionales (OTP)</td>
              <td>Direccion de email</td>
            </tr>
            <tr>
              <td>Upstash Redis</td>
              <td>Almacenamiento temporal de codigos OTP y rate limiting</td>
              <td>Email (hasheado), IP (anonimizada)</td>
            </tr>
            <tr>
              <td>Stripe</td>
              <td>Procesamiento de pagos (plan Premium)</td>
              <td>Datos de facturacion (gestionados directamente por Stripe)</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="legal-section">
        <h2>5. Retencion de datos</h2>
        <ul>
          <li><strong>Datos de cuenta:</strong> mientras mantengas tu cuenta activa.</li>
          <li><strong>Codigos OTP:</strong> 5 minutos (eliminados automaticamente).</li>
          <li><strong>Logs de acceso:</strong> maximo 30 dias.</li>
          <li><strong>Datos de pago:</strong> segun la politica de retencion de Stripe y requisitos fiscales.</li>
        </ul>
        <p>
          Cuando elimines tu cuenta, todos tus datos personales seran eliminados de forma
          permanente en un plazo maximo de 30 dias.
        </p>
      </section>

      <section className="legal-section">
        <h2>6. Tus derechos (GDPR / CCPA)</h2>
        <p>Tienes derecho a:</p>
        <ul>
          <li><strong>Acceso:</strong> solicitar una copia de todos tus datos.</li>
          <li><strong>Rectificacion:</strong> corregir datos inexactos.</li>
          <li><strong>Supresion:</strong> eliminar tu cuenta y todos tus datos.</li>
          <li><strong>Portabilidad:</strong> recibir tus datos en formato legible por maquina.</li>
          <li><strong>Oposicion:</strong> oponerte al tratamiento de tus datos.</li>
          <li><strong>Limitacion:</strong> restringir el procesamiento de tus datos.</li>
          <li><strong>No discriminacion (CCPA):</strong> no seras penalizado por ejercer tus derechos.</li>
        </ul>
        <p>
          Para ejercer cualquier derecho, escribe a{" "}
          <a href="mailto:privacidad@lumio.app">privacidad@lumio.app</a>.
          Responderemos en un plazo maximo de 30 dias.
        </p>
      </section>

      <section className="legal-section">
        <h2>7. Seguridad</h2>
        <ul>
          <li>Cifrado en transito (HTTPS/TLS) y en reposo (AES-256 en Supabase).</li>
          <li>Autenticacion basada en OTP (sin contrasenas almacenadas).</li>
          <li>Rate limiting para prevenir ataques de fuerza bruta.</li>
          <li>Row Level Security (RLS) a nivel de base de datos.</li>
          <li>Cabeceras de seguridad: HSTS, CSP, X-Frame-Options, X-Content-Type-Options.</li>
          <li>Variables de entorno para secretos (nunca en codigo fuente).</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>8. Transferencias internacionales</h2>
        <p>
          Tus datos se almacenan en la Union Europea (AWS EU-WEST-1, Irlanda). Algunos
          proveedores (Vercel, Resend, Stripe) pueden procesar datos en Estados Unidos bajo
          el marco EU-US Data Privacy Framework o clausulas contractuales tipo aprobadas por
          la Comision Europea.
        </p>
      </section>

      <section className="legal-section">
        <h2>9. Menores de edad</h2>
        <p>
          Lumio no esta dirigido a menores de 16 anos. No recopilamos conscientemente datos
          de menores. Si eres padre/tutor y crees que tu hijo ha proporcionado datos,
          contactanos para eliminarlos.
        </p>
      </section>

      <section className="legal-section">
        <h2>10. Cambios en esta politica</h2>
        <p>
          Podemos actualizar esta politica ocasionalmente. Publicaremos cualquier cambio en
          esta pagina con la fecha de actualizacion. Para cambios significativos, te
          notificaremos por email.
        </p>
      </section>

      <section className="legal-section">
        <h2>11. Contacto</h2>
        <p>
          Para cualquier pregunta sobre privacidad:{" "}
          <a href="mailto:privacidad@lumio.app">privacidad@lumio.app</a>
        </p>
      </section>
    </article>
  );
}
