import Airtable from "airtable";
import sgMail from "@sendgrid/mail";


const tableName = process.env.AIRTABLE_TABLE || "Participants";


function shuffle(array) {
// Fisher-Yates
const a = [...array];
for (let i = a.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
[a[i], a[j]] = [a[j], a[i]];
}
return a;
}

export async function handler(event) {
    const auth = (event.headers.authorization || "").replace(/^Bearer\s*/i, "");
    if (!auth || auth !== process.env.ADMIN_KEY) {
    return { statusCode: 403, body: "Forbidden" };
    }
    
    
    const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(
    process.env.AIRTABLE_BASE_ID
    );
    
    
    try {
    const records = await base(tableName).select({ view: "Grid view" }).all();
    const people = records.map((r) => ({ id: r.id, name: r.get("Name"), email: r.get("Email") }));
    
    
    if (people.length < 2) {
    return { statusCode: 400, body: "Need at least 2 participants" };
    }
    
    
    const shuffled = shuffle(people);
    // pair each i -> (i+1)%n
    const assignments = shuffled.map((giver, i) => ({
    giver,
    receiver: shuffled[(i + 1) % shuffled.length],
    }));

// Save assignments to Airtable and send emails
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const msgs = [];
for (const pair of assignments) {
// Update Airtable record with assigned info
await base(tableName).update(pair.giver.id, {
AssignedTo: pair.receiver.name,
AssignedEmail: pair.receiver.email,
});


msgs.push({
to: pair.giver.email,
from: process.env.FROM_EMAIL,
subject: "Your Secret Santa assignment!",
text: `Hi ${pair.giver.name},\n\nYou're the Secret Santa for: ${pair.receiver.name} <${pair.receiver.email}>\n\nHappy gifting!`,
});
}


// Send all emails (SendGrid supports batched sends but we'll send sequentially to be simple)
for (const m of msgs) {
await sgMail.send(m);
}


return { statusCode: 200, body: JSON.stringify({ ok: true, count: assignments.length }) };
} catch (err) {
console.error(err);
return { statusCode: 500, body: "Server error" };
}
}