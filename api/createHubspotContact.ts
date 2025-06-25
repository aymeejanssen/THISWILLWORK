export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Only POST allowed");

  const { name, email, dob, sex, country } = req.body;

  const [day, month, year] = dob.split("-");
  const formattedDOB = `${year}-${month}-${day}`; // convert to ISO

  const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
  const endpoint = "https://api.hubapi.com/crm/v3/objects/contacts";

  const payload = {
    properties: {
      email,
      firstname: name,
      date_of_birth: formattedDOB,
      sex,
      country,
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HUBSPOT_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (response.ok) {
    res.status(200).json({ success: true, data });
  } else {
    res.status(500).json({ success: false, error: data });
  }
}
