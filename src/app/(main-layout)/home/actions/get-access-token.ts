"use server";

export async function getAccessToken() {
  const consumer_key = process.env.CONSUMER_KEY;
  const consumer_secret = process.env.CONSUMER_SECRET;
  const queryString = `?${new URLSearchParams({
    consumer_key: consumer_key!,
    consumer_secret: consumer_secret!,
  }).toString()}`;

  const base_url = process.env.SGIS_BASE_URL;
  const url = `${base_url}/OpenAPI3/auth/authentication.json${queryString}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      //   body: JSON.stringify({
      //     consumer_key: consumer_key!,
      //     consumer_secret: consumer_secret!,
      //   }),
    });
    if (!response.ok) {
      throw new Error("Failed to get access token");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to get access token:", error);
    throw new Error("Failed to get access token");
  }
}
