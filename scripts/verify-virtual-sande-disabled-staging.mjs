/**
 * Read-only post-deploy check. This file MUST NEVER call OpenAI,
 * update a setting or submit personal data.
 * Env: WPA_STAGE_URL, WPA_AGENT_STAGING_TOKEN
 */
const base=process.env.WPA_STAGE_URL;
const token=process.env.WPA_AGENT_STAGING_TOKEN;
if(!base || !/^https:\/\/[^/]+\.workers\.dev\/?$/.test(base) ||
   !base.includes('wpa-virtual-sande-agent-private-staging.') ||
   !token || token.length<24){
  console.error('STAGING_SMOKE_CONFIG_MISSING');
  process.exit(2);
}
const url=base.replace(/\/$/,'')+'/agent/capabilities';
let unauthStatus=null;
// Fresh workers.dev deployment may take a moment to propagate. Retry only
// the read-only unauthenticated capability check; never run paid requests.
for(let attempt=0;attempt<6;attempt++){
  try{
    const denied=await fetch(url,{headers:{Origin:'https://worldprotocolacademy.mk'},redirect:'error'});
    unauthStatus=denied.status;
    if(unauthStatus===403)break;
  }catch{}
  await new Promise(resolve=>setTimeout(resolve,2000));
}
if(unauthStatus!==403){
  console.error('STAGING_AUTH_BYPASS_CHECK_FAILED: '+unauthStatus);
  process.exit(1);
}
let result;
for(let attempt=0;attempt<6;attempt++){
  try{
    const response=await fetch(url,{headers:{Origin:'https://worldprotocolacademy.mk','X-WPA-Stage-Token':token},redirect:'error'});
    if(response.status===200){result=await response.json();break;}
  }catch{}
  await new Promise(resolve=>setTimeout(resolve,2000));
}
if(!result || result.ok!==true || result.enabled!==false ||
   result.pdf_synthesis!==false || result.image_analysis!==false ||
   result.model_connection_status!=='NOT_CONNECTED'){
  console.error('STAGING_DISABLED_CAPABILITY_ASSERTION_FAILED');
  process.exit(1);
}
console.log('PASS: staging URL requires private auth and advertises ZERO live model capabilities');
