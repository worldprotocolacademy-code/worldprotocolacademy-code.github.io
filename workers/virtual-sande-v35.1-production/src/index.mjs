import worker from '../../../tools/virtual-sande/wpa-protocol-bot-v35.1-safe-entrypoint.mjs';
import { withOriginalAiSearchSourceNames } from '../../../tools/virtual-sande/wpa-protocol-bot-v35.1-ai-search-source-metadata.mjs';
import { tryHandleSymbols } from '../../../tools/virtual-sande/wpa-symbols-active-router-v1.mjs';
import { withStrategicPromptRouting } from '../../../tools/virtual-sande/wpa-strategic-prompt-router.mjs';

const base = withOriginalAiSearchSourceNames(worker);
const routed = withStrategicPromptRouting(base);

export default {
  async fetch(request, env, ctx) {
    // Optional read-only multimodal pilot; returns null for all canonical routes.
    const agent = await maybeHandleAgent(request, env);
    if (agent) return agent;
    const symbols = await tryHandleSymbols(request, env);
    if (symbols) return symbols;
    return routed.fetch(request, env, ctx);
  }
};