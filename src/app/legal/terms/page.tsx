import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terminos y Condiciones | Lumio",
  description: "Terminos y condiciones de uso de Lumio.",
};

export default function TermsPage() {
  return (
    <article className="legal-article">
      <header className="legal-header">
        <p className="legal-label">Ultima actualizacion: 18 de mayo de 2026</p>
        <h1 className="legal-title">Terminos y Condiciones</h1>
        <p className="legal-subtitle">
          Estos terminos rigen el uso de Lumio. Al crear una cuenta o usar la
          aplicacion, aceptas estos terminos en su totalidad.
        </p>
      </header>

      {/* --- 1. Definiciones --- */}
      <section className="legal-section">
        <h2>1. Definiciones</h2>
        <ul>
          <li><strong>&quot;Lumio&quot;</strong> o <strong>&quot;el Servicio&quot;</strong>: la aplicacion web de productividad y nutricion accesible en lumio.app.</li>
          <li><strong>&quot;Usuario&quot;</strong>: cualquier persona que cree una cuenta o utilice el Servicio.</li>
          <li><strong>&quot;Contenido del Usuario&quot;</strong>: cualquier dato, texto, imagen o archivo que subas a Lumio.</li>
        </ul>
      </section>

      {/* --- 2. Uso del servicio --- */}
      <section className="legal-section">
        <h2>2. Uso aceptable</h2>
        <p>Al usar Lumio, te comprometes a:</p>
        <ul>
          <li>Proporcionar informacion veraz al crear tu cuenta.</li>
          <li>No compartir tu acceso con terceros.</li>
          <li>No intentar acceder a datos de otros usuarios.</li>
          <li>No usar el Servicio para actividades ilegales.</li>
          <li>No intentar eludir las medidas de seguridad o rate limiting.</li>
          <li>No subir contenido malicioso, ilegal o que infrinja derechos de terceros.</li>
        </ul>
        <p>
          Nos reservamos el derecho de suspender o cancelar cuentas que violen estos terminos.
        </p>
      </section>

      {/* --- 3. Cuentas --- */}
      <section className="legal-section">
        <h2>3. Cuentas y autenticacion</h2>
        <p>
          Puedes crear una cuenta mediante email con codigo OTP o a traves de Google OAuth.
          Eres responsable de mantener la seguridad de tu cuenta y de todas las actividades
          que se realicen bajo ella.
        </p>
        <p>
          No almacenamos contrasenas. La autenticacion se realiza mediante codigos de un solo
          uso (OTP) enviados a tu email o mediante el sistema de autenticacion de Google.
        </p>
      </section>

      {/* --- 4. Contenido del usuario --- */}
      <section className="legal-section">
        <h2>4. Contenido generado por el usuario</h2>
        <h3>4.1 Propiedad</h3>
        <p>
          Tu conservas todos los derechos de propiedad intelectual sobre el contenido que
          subas a Lumio (fotos de alimentos, entradas de diario, etc.). Nos concedes una
          licencia limitada, no exclusiva y revocable para almacenar, procesar y mostrar
          dicho contenido unicamente con el fin de prestarte el Servicio.
        </p>

        <h3>4.2 Responsabilidad</h3>
        <p>
          Eres el unico responsable del contenido que subas. No debes subir contenido que:
        </p>
        <ul>
          <li>Infrinja derechos de autor, marcas comerciales u otros derechos de propiedad intelectual.</li>
          <li>Sea ilegal, difamatorio, obsceno o danino.</li>
          <li>Contenga malware o codigo malicioso.</li>
        </ul>

        <h3>4.3 DMCA &mdash; Retirada de contenido por infraccion de derechos de autor</h3>
        <p>
          Lumio respeta los derechos de propiedad intelectual. Si crees que algun contenido
          en nuestro servicio infringe tus derechos de autor, puedes enviar una notificacion
          de retirada conforme a la Digital Millennium Copyright Act (DMCA) a:
        </p>
        <p className="legal-highlight">
          <strong>Agente DMCA designado:</strong><br />
          Email: <a href="mailto:dmca@lumio.app">dmca@lumio.app</a>
        </p>
        <p>Tu notificacion debe incluir:</p>
        <ol>
          <li>Identificacion de la obra protegida que consideras infringida.</li>
          <li>Identificacion del material infractor y su ubicacion en el Servicio.</li>
          <li>Tu informacion de contacto (nombre, direccion, telefono, email).</li>
          <li>Una declaracion de buena fe de que el uso no esta autorizado.</li>
          <li>Una declaracion, bajo pena de perjurio, de que la informacion es exacta y que eres el titular de los derechos o su representante autorizado.</li>
          <li>Tu firma fisica o electronica.</li>
        </ol>
        <p>
          Tras recibir una notificacion valida, retiraremos el contenido infractor en un
          plazo razonable y notificaremos al usuario afectado.
        </p>
      </section>

      {/* --- 5. Suscripciones y pagos --- */}
      <section className="legal-section">
        <h2>5. Suscripciones y pagos</h2>

        <h3>5.1 Planes disponibles</h3>
        <p>
          Lumio ofrece un plan <strong>gratuito (Free)</strong> con funcionalidades basicas
          y un plan <strong>Premium</strong> con funcionalidades avanzadas. Los precios,
          caracteristicas y condiciones de cada plan se detallan en la pagina de precios
          antes de la contratacion.
        </p>

        <h3>5.2 Transparencia en los cobros</h3>
        <p>Antes de completar cualquier pago, te mostraremos claramente:</p>
        <ul>
          <li>El precio exacto del plan (impuestos incluidos donde aplique).</li>
          <li>La frecuencia de cobro (mensual o anual).</li>
          <li>Que la suscripcion se renueva automaticamente.</li>
          <li>La fecha del proximo cobro.</li>
        </ul>

        <h3>5.3 Cancelacion</h3>
        <p>
          Puedes cancelar tu suscripcion Premium en cualquier momento desde la seccion
          de perfil de la aplicacion. La cancelacion es efectiva al final del periodo de
          facturacion vigente &mdash; seguiras teniendo acceso Premium hasta esa fecha.
          No se realizaran cobros adicionales tras la cancelacion.
        </p>
        <p>
          <strong>Cumplimiento California (SB-313):</strong> El proceso de cancelacion es
          igual de sencillo que el de contratacion. No se requieren llamadas telefonicas,
          emails ni pasos adicionales innecesarios.
        </p>

        <h3>5.4 Reembolsos</h3>
        <p>
          Los pagos no son reembolsables salvo que la ley aplicable lo requiera. Si tienes
          un problema con un cobro, contactanos y lo resolveremos caso por caso.
        </p>

        <h3>5.5 Cambios de precio</h3>
        <p>
          Nos reservamos el derecho de modificar los precios. Te notificaremos con al
          menos 30 dias de antelacion antes de que el cambio afecte a tu suscripcion.
        </p>
      </section>

      {/* --- 6. Comunicaciones por email --- */}
      <section className="legal-section">
        <h2>6. Comunicaciones por email</h2>
        <h3>6.1 Emails transaccionales</h3>
        <p>
          Te enviaremos emails esenciales para el funcionamiento del servicio: codigos OTP
          de autenticacion, confirmaciones de pago y avisos de seguridad. Estos emails no
          requieren consentimiento y no pueden desactivarse mientras mantengas tu cuenta.
        </p>

        <h3>6.2 Emails promocionales (CAN-SPAM)</h3>
        <p>
          Si en el futuro enviamos comunicaciones de marketing o newsletters, cumpliremos
          con la ley CAN-SPAM y el GDPR:
        </p>
        <ul>
          <li>Solo se enviaran con tu consentimiento explicito (opt-in).</li>
          <li>Incluiran un enlace claro para darte de baja en cada correo.</li>
          <li>El asunto sera siempre honesto y no enganoso.</li>
          <li>Incluiran nuestra direccion postal.</li>
          <li>Las solicitudes de baja se procesaran en un maximo de 10 dias habiles.</li>
        </ul>
      </section>

      {/* --- 7. Propiedad intelectual --- */}
      <section className="legal-section">
        <h2>7. Propiedad intelectual</h2>
        <p>
          El diseno, codigo, marca, logotipo y contenido original de Lumio son propiedad de
          sus creadores y estan protegidos por las leyes de propiedad intelectual. No puedes
          copiar, modificar, distribuir o crear obras derivadas sin autorizacion.
        </p>
      </section>

      {/* --- 8. Salud --- */}
      <section className="legal-section">
        <h2>8. Aviso sobre informacion de salud</h2>
        <p>
          Lumio es una herramienta de seguimiento personal. <strong>No proporciona consejo
          medico, nutricional ni de salud profesional.</strong> Los calculos de calorias,
          macronutrientes, BMR y TDEE son estimaciones basadas en formulas estandar y
          pueden no ser precisos para tu caso particular.
        </p>
        <p>
          Consulta siempre con un profesional de la salud antes de realizar cambios
          significativos en tu dieta o rutina de ejercicio.
        </p>
      </section>

      {/* --- 9. Limitacion de responsabilidad --- */}
      <section className="legal-section">
        <h2>9. Limitacion de responsabilidad</h2>
        <p>
          Lumio se proporciona &quot;tal cual&quot; y &quot;segun disponibilidad&quot;. En la
          maxima medida permitida por la ley:
        </p>
        <ul>
          <li>No garantizamos que el Servicio sea ininterrumpido o libre de errores.</li>
          <li>No somos responsables de perdida de datos causada por circunstancias fuera de nuestro control.</li>
          <li>No somos responsables de decisiones que tomes basandote en la informacion del Servicio.</li>
          <li>Nuestra responsabilidad total se limita al importe que hayas pagado en los ultimos 12 meses.</li>
        </ul>
      </section>

      {/* --- 10. Terminacion --- */}
      <section className="legal-section">
        <h2>10. Terminacion</h2>
        <p>
          Puedes eliminar tu cuenta en cualquier momento desde tu perfil. Nos reservamos el
          derecho de suspender o cancelar cuentas que violen estos terminos, con o sin previo
          aviso. Tras la eliminacion, tus datos seran borrados segun lo descrito en nuestra
          Politica de Privacidad.
        </p>
      </section>

      {/* --- 11. Ley aplicable --- */}
      <section className="legal-section">
        <h2>11. Ley aplicable y jurisdiccion</h2>
        <p>
          Estos terminos se rigen por las leyes de Espana y la Union Europea. Para
          usuarios en Estados Unidos, se aplican adicionalmente las leyes federales
          aplicables (DMCA, CAN-SPAM, CCPA). Cualquier disputa se resolvera en los
          tribunales competentes del domicilio del responsable.
        </p>
      </section>

      {/* --- 12. Modificaciones --- */}
      <section className="legal-section">
        <h2>12. Modificaciones</h2>
        <p>
          Podemos modificar estos terminos. Publicaremos los cambios en esta pagina y, para
          cambios materiales, te notificaremos por email con al menos 15 dias de antelacion.
          El uso continuado del Servicio tras la notificacion constituye aceptacion.
        </p>
      </section>

      {/* --- 13. Contacto --- */}
      <section className="legal-section">
        <h2>13. Contacto</h2>
        <p>
          Para dudas sobre estos terminos:{" "}
          <a href="mailto:legal@lumio.app">legal@lumio.app</a>
        </p>
      </section>
    </article>
  );
}
