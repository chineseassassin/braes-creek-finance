import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Only initialize Resend if API key is present
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, fullName, role, message, inviteId, expiresAt } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Determine the app's base URL dynamically
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    // Encode invite data as base64 so the invite page works cross-device
    // (even if the recipient opens the link in a fresh browser with no local store)
    const invitePayload = {
      id: inviteId,
      email,
      fullName: fullName || '',
      role: role || 'View Only',
      message: message || '',
      expiresAt: expiresAt || '',
      status: 'pending',
      invitedAt: new Date().toISOString()
    };
    const encoded = Buffer.from(JSON.stringify(invitePayload)).toString('base64');
    const inviteLink = `${baseUrl}/invite/${inviteId}?d=${encodeURIComponent(encoded)}`;

    if (resend) {
      const fromEmail = process.env.EMAIL_FROM_ADDRESS || 'invites@braescreek.com';
      
      await resend.emails.send({
        from: `Braes Creek <${fromEmail}>`,
        to: [email],
        subject: `You've been invited to join Braes Creek Farm Finance`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You're invited!</h2>
            <p>Hi ${fullName || 'there'},</p>
            <p>You've been invited to join Braes Creek Farm Finance with the role: <strong>${role}</strong>.</p>
            ${message ? `<p><strong>Message:</strong><br/><em>${message}</em></p>` : ''}
            <div style="margin: 30px 0;">
              <a href="${inviteLink}" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation</a>
            </div>
            <p style="color: #666; font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        `
      });

      return NextResponse.json({ success: true, method: 'resend', status: 'Email Sent', inviteLink });
    } else {
      // Local dev fallback — log the full link so it can be tested
      console.log('=============================================');
      console.log('📨 SIMULATED INVITE EMAIL');
      console.log('=============================================');
      console.log(`To: ${email}`);
      console.log(`Role: ${role}`);
      console.log(`Invite Link: ${inviteLink}`);
      console.log('=============================================');

      return NextResponse.json({ success: true, method: 'console', status: 'Local Only', inviteLink });
    }
  } catch (error) {
    console.error('Error processing invite:', error);
    return NextResponse.json({ error: 'Internal Server Error', status: 'Failed' }, { status: 500 });
  }
}

