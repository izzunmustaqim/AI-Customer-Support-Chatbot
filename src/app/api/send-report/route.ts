// import { NextResponse } from 'next/server';
// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

// export async function POST(req: Request) {
//   try {
//     const { email, reportText, subject } = await req.json();

//     if (!email || !reportText) {
//       return NextResponse.json(
//         { error: 'Email and report text are required' },
//         { status: 400 }
//       );
//     }

//     if (!process.env.RESEND_API_KEY) {
//       return NextResponse.json(
//         { error: 'Email service is not configured' },
//         { status: 503 }
//       );
//     }

//     // Convert report text to styled HTML email
//     const htmlContent = convertReportToHtml(reportText);

//     const { error } = await resend.emails.send({
//       from: process.env.RESEND_FROM_EMAIL || 'EECA Assessment <onboarding@resend.dev>',
//       to: [email],
//       subject: subject || 'Your EECA Compliance & Readiness Assessment Report',
//       html: htmlContent,
//     });

//     if (error) {
//       console.error('Resend error:', error);
//       return NextResponse.json(
//         { error: 'Failed to send email' },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error('Send report error:', err);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// /**
//  * Convert the AI's report text into a styled HTML email
//  */
// function convertReportToHtml(text: string): string {
//   // Clean markdown
//   let html = text
//     .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
//     .replace(/### (.*)/g, '<h3 style="color: #1e1b4b; margin-top: 20px;">$1</h3>')
//     .replace(/## (.*)/g, '<h2 style="color: #1e1b4b; margin-top: 24px;">$1</h2>')
//     .replace(/\[OPTION\].*?\[\/OPTION\]/g, '')
//     .replace(/\[CHECKBOX\].*?\[\/CHECKBOX\]/g, '');

//   // Convert bullet points
//   html = html.replace(/^- (.*)/gm, '<li style="margin: 4px 0;">$1</li>');
//   html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="padding-left: 20px;">$&</ul>');

//   // Convert table rows
//   const tableRegex = /(\|.*\|[\n])+/g;
//   html = html.replace(tableRegex, (match) => {
//     const rows = match.trim().split('\n').filter(r => !r.match(/^[\s|:-]+$/));
//     if (rows.length === 0) return '';
//     let table = '<table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px;">';
//     rows.forEach((row, i) => {
//       const cells = row.split('|').filter(c => c.trim());
//       const tag = i === 0 ? 'th' : 'td';
//       const bgColor = i === 0 ? '#8b5cf6' : (i % 2 === 0 ? '#f8f7ff' : '#ffffff');
//       const textColor = i === 0 ? '#ffffff' : '#1e1b4b';
//       table += '<tr>';
//       cells.forEach(cell => {
//         table += `<${tag} style="padding: 8px 12px; border: 1px solid #e5e7eb; background: ${bgColor}; color: ${textColor}; text-align: left;">${cell.trim()}</${tag}>`;
//       });
//       table += '</tr>';
//     });
//     table += '</table>';
//     return table;
//   });

//   // Convert newlines to <br>
//   html = html.replace(/\n/g, '<br>');

//   const date = new Date().toLocaleDateString('en-MY', {
//     day: 'numeric',
//     month: 'long',
//     year: 'numeric',
//   });

//   return `
//     <!DOCTYPE html>
//     <html>
//     <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e1b4b;">
//       <!-- Header -->
//       <div style="background: linear-gradient(135deg, #1e1b4b, #4c1d95); padding: 24px; border-radius: 12px 12px 0 0;">
//         <h1 style="color: white; margin: 0; font-size: 20px;">EECA Compliance & Readiness</h1>
//         <p style="color: #c4b5fd; margin: 4px 0 0; font-size: 14px;">Assessment Report — ${date}</p>
//       </div>
      
//       <!-- Content -->
//       <div style="padding: 24px; background: #ffffff; border: 1px solid #e5e7eb;">
//         ${html}
//       </div>
      
//       <!-- Footer -->
//       <div style="background: #f8f7ff; padding: 16px 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
//         <p style="margin: 0; font-size: 12px; color: #6b7280;">
//           Prepared by <strong>Sandhurst Advisory</strong> in collaboration with <strong>Enerlytic Intelligence</strong>
//         </p>
//         <p style="margin: 4px 0 0; font-size: 11px; color: #9ca3af;">
//           This report is auto-generated. For professional advisory, contact Sandhurst Advisory.
//         </p>
//       </div>
//     </body>
//     </html>
//   `;
// }
