import fs from "fs/promises";
const status=JSON.parse(await fs.readFile("status.json","utf8"));
console.log("WPA Watch status:", status);
