export async function handler(event) {
    const { name, email } = JSON.parse(event.body || "{}");
  
    const result = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fields: { name, email }
        })
      }
    );
  
    const data = await result.json();
  
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  }
  