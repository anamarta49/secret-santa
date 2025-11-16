import Airtable from "airtable";
import sgMail from "@sendgrid/mail";
import { randomUUID } from "crypto";

const tableName = process.env.AIRTABLE_TABLE || "Participants";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const body = JSON.parse(event.body || "{}");
  const name = (body.name || "").trim();
  const email = (body.email || "").trim();

  if (!name || !email) {
    return { statusCode: 400, body: "Missing name or email" };
  }

  const editToken = randomUUID();

  const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(
    process.env.AIRTABLE_BASE_ID
  );

  try {
    const created = await base(tableName).create({
      Name: name,
      Email: email,
      EditToken: editToken,
    });

    // Send confirmation email with edit link
    sgMail.setApiKey(process.env.SENDGRID_KEY);

    const siteUrl = process.env.SITE_URL || "";
    const editLink = `${siteUrl}/.netlify/functions/edit?token=${encodeURIComponent(
      editToken
    )}&recordId=${encodeURIComponent(created.id)}`;

    const msg = {
      to: email,
      from: process.env.FROM_EMAIL,
      subject: `Thanks for joining Secret Santa!`,
      text: `Hi ${name},\n\nThanks for registering for our Secret Santa! 🎄`,
    };

    await sgMail.send(msg);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Server error" };
  }
}
