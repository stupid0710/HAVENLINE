import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, appointment, googleAccessToken } = body;

    if (!email || !appointment) {
      return NextResponse.json({ success: false, error: 'Missing email or appointment details' }, { status: 400 });
    }

    const token = appointment.token || 'T-XXX';
    
    // Calculate total cost outline
    const consultFee = appointment.consultationFee || 500;
    const estDiag = Math.round(consultFee * 2);
    const estMed = Math.round(consultFee * 0.8);
    const totalOutlay = consultFee + estDiag + estMed;

    // Create the HTML email content
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Havenline Reservation Secure Stub - ${token}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      background-color: #060a08;
      color: #ffffff;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      max-width: 600px;
      margin: 40px auto;
      background-color: #0a0f0d;
      border: 1px solid rgba(52, 211, 153, 0.2);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .header {
      padding: 30px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      position: relative;
    }
    .top-glow {
      height: 3px;
      background: linear-gradient(90deg, transparent, #00C853, transparent);
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }
    .logo {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .logo span {
      color: #00C853;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      background-color: rgba(0, 200, 83, 0.1);
      border: 1px solid rgba(0, 200, 83, 0.2);
      color: #00C853;
      font-size: 11px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 30px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .body-content {
      padding: 30px;
      font-size: 12px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.85);
    }
    .grid-metrics {
      display: grid;
      grid-template-cols: 1fr 1fr;
      gap: 15px;
      margin: 20px 0;
    }
    .metric-card {
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 15px;
      text-align: center;
    }
    .metric-label {
      font-size: 9px;
      color: rgba(255, 255, 255, 0.4);
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 700;
    }
    .metric-value {
      font-size: 18px;
      font-weight: 900;
      color: #ffffff;
      margin-top: 5px;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
    }
    .details-table td {
      padding: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .details-table td.label {
      color: rgba(255, 255, 255, 0.4);
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 700;
      width: 130px;
    }
    .details-table td.value {
      color: #ffffff;
      font-weight: 700;
      font-size: 12px;
    }
    .subsidized-box {
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 20px;
      margin: 25px 0;
    }
    .subsidized-header {
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #00C853;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .invoice-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 11px;
    }
    .invoice-row.total {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 12px;
      font-weight: 900;
      color: #00C853;
      font-size: 13px;
    }
    .footer {
      padding: 20px 30px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      background-color: rgba(0, 0, 0, 0.2);
    }
    .footer-text {
      font-size: 9px;
      color: rgba(255, 255, 255, 0.35);
      text-transform: uppercase;
      letter-spacing: 1px;
      line-height: 1.5;
    }
  </style>
</head>
<body>

  <div class="wrapper">
    <div class="header">
      <div class="top-glow"></div>
      <div class="logo">HAVEN<span>LINE</span> // CLINICAL_RECIEPT</div>
      <div class="status-badge">RESERVATION SECURED & LOCK CONFIRMED</div>
    </div>

    <div class="body-content">
      <p>Dear ${appointment.patientName},</p>
      <p>Your outpatient clinic reservation lock has been verified and synced across the Havenline cloud frame. Below are your unique queue tickets and clinic details.</p>

      <div class="grid-metrics">
        <div class="metric-card">
          <div class="metric-label">Queue Spot Token</div>
          <div class="metric-value" style="color: #00C853;">${token}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Patients Ahead</div>
          <div class="metric-value">${appointment.queuePosition}</div>
        </div>
      </div>

      <table class="details-table">
        <tr>
          <td class="label">Hospital / Node</td>
          <td class="value">${appointment.hospitalName}</td>
        </tr>
        <tr>
          <td class="label">Specialist</td>
          <td class="value">${appointment.doctorName}</td>
        </tr>
        <tr>
          <td class="label">Department</td>
          <td class="value">${appointment.department}</td>
        </tr>
        <tr>
          <td class="label">Time slot</td>
          <td class="value">${appointment.timeSlot}</td>
        </tr>
        <tr>
          <td class="label">Triage Urgency</td>
          <td class="value" style="color: ${appointment.urgency === 'Critical' ? '#EF4444' : appointment.urgency === 'High' ? '#F59E0B' : '#00C853'};">${appointment.urgency}</td>
        </tr>
      </table>

      <div class="subsidized-box">
        <div class="subsidized-header">Subsidized Invoice Summaries</div>
        <div class="invoice-row">
          <span>OPD CONSULTATION FEE:</span>
          <span>₹${consultFee}</span>
        </div>
        <div class="invoice-row">
          <span>EST. DIAGNOSTICS (ECG/BLOOD):</span>
          <span>₹${estDiag}</span>
        </div>
        <div class="invoice-row">
          <span>EST. MEDICATION STUB:</span>
          <span>₹${estMed}</span>
        </div>
        <div class="invoice-row total">
          <span>ESTIMATED TOTAL OUTLAY:</span>
          <span>₹${totalOutlay}</span>
        </div>
      </div>

      <p style="font-size: 10px; color: rgba(255,255,255,0.4); text-align: center; margin-top: 30px;">
        * Present this ticket stub code at reception. Ensure you arrive at least 15 minutes before the estimated turn time.
      </p>
    </div>

    <div class="footer">
      <div class="footer-text">
        HAVENLINE CLINICAL TRIAGE INTELLIGENCE CORE SYSTEM<br>
        SECURE INTAKE PORTAL v3 // TRANSACTION CERTIFIED BY LOCALHOST
      </div>
    </div>
  </div>

</body>
</html>
    `;

    // Ensure the output public/emails directory exists
    const publicDir = path.join(process.cwd(), 'public');
    const emailsDir = path.join(publicDir, 'emails');
    if (!fs.existsSync(emailsDir)) {
      fs.mkdirSync(emailsDir, { recursive: true });
    }

    const filename = `booking_${token}.html`;
    const filePath = path.join(emailsDir, filename);
    fs.writeFileSync(filePath, htmlContent, 'utf8');

    // Also write a console warning/log to server stdout so the developer knows where to look!
    console.warn(`\n[EMAIL DISPATCHED] Booking confirmation email successfully "sent" to ${email.toUpperCase()}!`);
    console.warn(`[LOCAL EMAIL LINK] Open http://localhost:3000/emails/${filename} in your browser to view the email receipt.\n`);

    // Support OAuth2 client access token OR backend nodemailer transport (App Password)
    const appPassword = process.env.GMAIL_APP_PASSWORD;
    const gmailUser = 'anubhav2000tyagi@gmail.com';
    let apiCallResult = null;

    if (appPassword) {
      try {
        console.warn(`[NODEMAILER] Attempting real message dispatch to ${email} via SMTP...`);
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailUser,
            pass: appPassword
          }
        });

        const mailOptions = {
          from: `"Havenline Intake Core" <${gmailUser}>`,
          to: email,
          subject: `Havenline Secure Reservation Receipt - ${token}`,
          html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.warn('[NODEMAILER] Real email dispatched successfully via SMTP!', info);
        apiCallResult = { success: true, messageId: info.messageId };
      } catch (err: any) {
        console.error('[NODEMAILER ERROR] Failed to dispatch via SMTP:', err.message);
        apiCallResult = { success: false, error: err.message };
      }
    } else if (googleAccessToken) {
      try {
        console.warn(`[GMAIL API] Attempting real message dispatch to ${email} via Gmail REST API...`);
        const subject = `Havenline Secure Reservation Receipt - ${token}`;
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const messageParts = [
          `To: ${email}`,
          `Content-Type: text/html; charset=utf-8`,
          `MIME-Version: 1.0`,
          `Subject: ${utf8Subject}`,
          ``,
          htmlContent
        ];
        const message = messageParts.join('\n');
        const encodedMessage = Buffer.from(message)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`;
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${googleAccessToken}`
        };

        const apiRes = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            raw: encodedMessage
          })
        });

        const apiResData = await apiRes.json();
        if (apiRes.ok) {
          console.warn('[GMAIL API] Real email dispatched successfully!', apiResData);
          apiCallResult = { success: true, data: apiResData };
        } else {
          console.warn('[GMAIL API WARNING] Google API rejected call:', apiResData);
          apiCallResult = { success: false, error: apiResData };
        }
      } catch (err: any) {
        console.error('[GMAIL API ERROR] Failed to dispatch via Google API:', err.message);
        apiCallResult = { success: false, error: err.message };
      }
    } else {
      console.warn('[EMAIL DISPATCH] Real mail sending skipped because GMAIL_APP_PASSWORD is not set in env variables.');
      apiCallResult = { success: false, error: 'GMAIL_APP_PASSWORD is not set in env variables. Please add it to .env.local to send from anubhav2000tyagi@gmail.com' };
    }

    return NextResponse.json({ 
      success: true, 
      emailSent: true, 
      url: `/emails/${filename}`,
      apiCallResult
    });
  } catch (e: any) {
    console.error('Email API failure:', e);
    return NextResponse.json({ success: false, error: e.message || 'Server error' }, { status: 500 });
  }
}
