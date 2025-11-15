import Airtable from "airtable";
import sgMail from "@sendgrid/mail";
import { v4 as uuidv4 } from "uuid";


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


const editToken = uuidv4();


const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
process.env.AIRTABLE_BASE
);


try {
const created = await base(tableName).create({
Name: name,
Email: email,
EditToken: editToken,
});


// Send confirmation email with edit link
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const siteUrl = process.env.SITE_URL || "";
const editLink = `${siteUrl}/.netlify/functions/edit?token=${encodeURIComponent(
editToken
)}&recordId=${encodeURIComponent(created.id)}`;


const msg = {
to: email,
from: process.env.FROM_EMAIL,
subject: `Thanks for joining Secret Santa!`,
text: `Hi ${name},\n\nThanks for registering for our Secret Santa. If you need to update your name or email later, use this secure edit link:\n\n${editLink}\n\nKeep it secret!`,
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