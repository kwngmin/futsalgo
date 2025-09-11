"use server";

export async function getDistricts(accessToken: string, cd: string) {
  const base_url = process.env.SGIS_BASE_URL;
  const queryString = `?${new URLSearchParams({
    accessToken,
    cd,
  }).toString()}`;

  const url = `${base_url}/OpenAPI3/addr/stage.json${queryString}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response, "response");
    if (!response.ok) {
      throw new Error("Failed to get districts");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to get districts:", error);
    throw new Error("Failed to get districts");
  }
}
