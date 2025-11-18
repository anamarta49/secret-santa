import Airtable from "airtable";

export async function handler(event, context) {
  try {
    // AUTH CHECK
    const adminToken = process.env.ADMIN_KEY;

    const authHeader = event.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : null;

    if (!token || token !== adminToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Unauthorized" }),
        headers: { "Content-Type": "application/json" }
      };
    }

    // Airtable setup
    const airtableToken = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = "Participants";

    if (!airtableToken || !baseId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing Airtable credentials" })
      };
    }

    const base = new Airtable({ apiKey: airtableToken }).base(baseId);

    // Fetch participants
    const records = await base(tableName)
      .select({
        fields: ["Name", "Email", "AssignedTo"],
        sort: [{ field: "Created", direction: "asc" }]
      })
      .all();

    const list = records.map((r) => ({
      id: r.id,
      name: r.get("Name"),
      email: r.get("Email"),
      assignedTo: r.get("AssignedTo") || null
    }));

    // Return clean JSON
    return {
      statusCode: 200,
      body: JSON.stringify(list),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    };

  } catch (err) {
    console.error("LIST ERROR:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
