/* Completely separate pilot Worker. Must never replace the certified WPA /ask runtime. */
import { maybeHandleAgent } from './agent-gateway.mjs';

export default {
  async fetch(request, env) {
    const response = await maybeHandleAgent(request, env);
    if (response) return response;
    return new Response('Not found', {
      status: 404,
      headers: {'cache-control':'no-store','content-type':'text/plain; charset=utf-8'}
    });
  }
};
