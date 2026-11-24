// WPA NEWS dispatch-only Cloudflare Worker. DO NOT store tokens in source.
// UTC schedule covers CET/CEST; only the Europe/Skopje 06h window can dispatch.
const URL = "https://api.github.com/repos/worldprotocolacademy-code/worldprotocolacademy-code.github.io/actions/workflows/wpa-media-programmes-production.yml/dispatches";

export function skopjeHour(utcDate) {
  const fields = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Skopje", hour: "2-digit", hourCycle: "h23"
  }).formatToParts(utcDate);
  return Number(fields.find(p => p.type === "hour")?.value);
}

export default {
  async scheduled(controller, env) {
    const now = new Date(controller.scheduledTime);
    if (!Number.isFinite(now.getTime())) throw new Error("Invalid scheduledTime");
    if (skopjeHour(now) !== 6) {
      console.log("WPA NEWS: no dispatch outside 06 Europe/Skopje");
      return false;
    }
    const token = env?.GITHUB_WORKFLOW_DISPATCH_TOKEN;
    if (!token) throw new Error("GITHUB_WORKFLOW_DISPATCH_TOKEN secret not configured");
    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": "Bearer " + token,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "wpa-news-cron-trigger"
      },
      body: JSON.stringify({ref:"main", inputs:{mode:"daily"}})
    });
    if (response.status !== 204) {
      throw new Error("GitHub workflow_dispatch rejected request: HTTP " + response.status);
    }
    console.log("WPA NEWS: workflow_dispatch accepted; NOT an edition/publishing confirmation");
    return true;
  }
};
