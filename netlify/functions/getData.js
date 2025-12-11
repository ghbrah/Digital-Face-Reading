import fetch from "node-fetch";

export async function handler() {
  try {
    const res = await fetch("https://api.example.com/data", {
      headers: { "Authorization": `Bearer ${process.env.API_KEY}` }
    });
    const data = await res.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, body: "The spirits are quiet." };
  }
}
