const fs = require('fs');
const { Resend } = require('resend');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const resend = new Resend(env.RESEND_API_KEY);

async function testEmail() {
  console.log("Testing Resend Delivery...");
  console.log("Using API KEY ending in:", env.RESEND_API_KEY ? env.RESEND_API_KEY.slice(-5) : "MISSING");
  console.log("Using From Email:", env.RESEND_FROM_EMAIL);

  try {
    const data = await resend.emails.send({
      from: `مكتب المحاماة <${env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: "reffaa1997@gmail.com", // testing target
      subject: "Test Diagnostic",
      html: "<p>This is a test email to verify domain connectivity.</p>",
    });
    console.log("✅ Success! Response:", data);
  } catch (error) {
    console.error("❌ Failed! Error:", error);
  }
}

testEmail();
