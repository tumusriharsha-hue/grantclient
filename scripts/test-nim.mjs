const apiKey = process.env.NVIDIA_API_KEY?.trim();
const model = process.env.NVIDIA_NIM_MODEL?.trim();
const baseUrl = (process.env.NVIDIA_NIM_BASE_URL?.trim() || "https://integrate.api.nvidia.com/v1").replace(/\/$/, "");
if (!apiKey || !model) {
  console.error("NVIDIA_API_KEY and NVIDIA_NIM_MODEL are required.");
  process.exit(1);
}
const started = Date.now();
const response = await fetch(`${baseUrl}/chat/completions`, {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model, messages: [{ role: "user", content: "Return JSON only." }], max_tokens: 20, temperature: 0, response_format: { type: "json_object" } }),
});
if (!response.ok) {
  console.error(`NVIDIA NIM smoke test failed with HTTP ${response.status}.`);
  process.exit(1);
}
const payload = await response.json();
const content = payload?.choices?.[0]?.message?.content;
if (typeof content !== "string" || !content.trim()) {
  console.error("NVIDIA NIM smoke test returned no valid completion.");
  process.exit(1);
}
console.log(JSON.stringify({ configured: true, authenticated: true, modelAccepted: true, validResponse: true, latencyMs: Date.now() - started, usage: payload.usage ?? null }));
