import Airtable from "airtable";


const tableName = process.env.AIRTABLE_TABLE || "Participants";


export async function handler(event) {
const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(
process.env.AIRTABLE_BASE_ID
);


if (event.httpMethod === "GET") {
const { token, recordId } = event.queryStringParameters || {};
if (!token || !recordId) {
return { statusCode: 400, body: "Missing token or recordId" };
}


try {
const record = await base(tableName).find(recordId);
if (!record) return { statusCode: 404, body: "Not found" };


const stored = record.get("EditToken");
if (stored !== token) return { statusCode: 403, body: "Forbidden" };


return {
statusCode: 200,
body: JSON.stringify({
id: record.id,
name: record.get("Name"),
email: record.get("Email"),
}),
};
} catch (err) {
console.error(err);
return { statusCode: 500, body: "Server error" };
}
}


if (event.httpMethod === "POST") {
// body: { recordId, token, name, email }
const body = JSON.parse(event.body || "{}");
const { recordId, token, name, email } = body;
if (!recordId || !token || !name || !email) {
return { statusCode: 400, body: "Missing fields" };
}


try {
const record = await base(tableName).find(recordId);
if (!record) return { statusCode: 404, body: "Not found" };
const stored = record.get("EditToken");
if (stored !== token) return { statusCode: 403, body: "Forbidden" };


await base(tableName).update(recordId, {
Name: name,
Email: email,
});


return { statusCode: 200, body: JSON.stringify({ ok: true }) };
} catch (err) {
console.error(err);
return { statusCode: 500, body: "Server error" };
}
}


return { statusCode: 405, body: "Method Not Allowed" };
}