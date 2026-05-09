import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key || key === "re_tu_api_key") return null;
  _resend = new Resend(key);
  return _resend;
}

export async function sendOtpEmail(email: string, code: string) {
  const resend = getResend();

  if (!resend) {
    console.log(`[EMAIL-DEV] To: ${email} | Code: ${code}`);
    return;
  }

  await resend.emails.send({
    from: "Lumio <onboarding@resend.dev>",
    to: email,
    subject: `${code} — Tu codigo de acceso a Lumio`,
    html: otpTemplate(code),
  });
}

function otpTemplate(code: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#090909;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#090909;padding:60px 20px;">
    <tr><td align="center">
      <table width="400" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;border:1px solid #222;">
        <tr><td style="padding:40px 36px 20px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:#E8E6DF;letter-spacing:-0.04em;">lumio</div>
        </td></tr>
        <tr><td style="padding:0 36px;text-align:center;">
          <p style="color:#999;font-size:14px;margin:0 0 28px;">Tu codigo de verificacion es:</p>
        </td></tr>
        <tr><td style="padding:0 36px;text-align:center;">
          <div style="font-size:36px;font-weight:700;letter-spacing:12px;color:#F2F2F0;background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:20px 0;font-family:'SF Mono',SFMono-Regular,Menlo,Consolas,monospace;">
            ${code}
          </div>
        </td></tr>
        <tr><td style="padding:24px 36px 40px;text-align:center;">
          <p style="color:#666;font-size:12px;margin:0;line-height:1.6;">
            Este codigo expira en 10 minutos.<br>
            Si no solicitaste este codigo, ignora este email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}
