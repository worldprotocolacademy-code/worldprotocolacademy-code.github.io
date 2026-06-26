// WPA Protocol Bot — National Days add-on snippet v1.1
// Safe snippet only. Add to existing worker after testing; do not replace the whole worker.

const WPA_NATIONAL_DAYS_MODULE = {
  ok: true,
  module_id: "wpa-national-days-knowledge-layer",
  parent_module_id: "wpa-symbols-protocol-lab",
  name: "WPA National Days Knowledge Layer",
  public_url: "https://worldprotocolacademy-code.github.io/wpaws/protocol-symbols/national-days-module.json",
  dataset_template_url: "https://worldprotocolacademy-code.github.io/wpaws/protocol-symbols/national-days-dataset-template.json",
  policy_url: "https://worldprotocolacademy-code.github.io/tools/virtual-sande/national-days-knowledge-policy.json",
  routing_url: "https://worldprotocolacademy-code.github.io/tools/virtual-sande/national-days-routing-addendum.json",
  coverage_goal: "National days for all countries and protocol entities in the WPA Symbols & Protocol Lab.",
  hard_rule: "Do not guess national days. Use verified dataset or mark as pending verification.",
  mk_uncertain_field: "Потребна е проверка од официјален или авторитетен извор."
};

// Example routes:
//
// if (url.pathname === "/symbols-protocol/national-days") {
//   return json(WPA_NATIONAL_DAYS_MODULE);
// }
//
// if (url.pathname === "/symbols-protocol/national-days/template") {
//   return Response.redirect(WPA_NATIONAL_DAYS_MODULE.dataset_template_url, 302);
// }
