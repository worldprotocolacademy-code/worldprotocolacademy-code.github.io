/* Same-origin, authenticated pilot client. Never uses the public /ask API.
 * A staging page must explicitly provide a wpa-private-workspace-api meta tag.
 */
export function createPrivateWorkspaceClient({origin=window.location.origin,configuredPath='',fetcher=fetch}={}){
  let base=null;
  if(configuredPath){
    try{
      const url=new URL(configuredPath,origin);
      if(url.origin===origin&&url.protocol==='https:'&&!url.search&&!url.hash&&url.pathname!=='/')base=url.origin+url.pathname.replace(/\/+$/,'');
    }catch{}
  }
  async function call(path,body,signal){
    if(!base)throw Error('PRIVATE_PILOT_NOT_CONFIGURED');
    const headers={'X-WPA-Consent':'document-processing','Accept':'application/json'};
    if(!(body instanceof FormData)){headers['Content-Type']='application/json';body=JSON.stringify(body);}
    const controller=new AbortController(),abort=()=>controller.abort();
    if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});
    const timer=setTimeout(abort,60000);
    try{
      const response=await fetcher(base+path,{method:'POST',headers,body,credentials:'same-origin',cache:'no-store',redirect:'error',signal:controller.signal});
      let data;try{data=await response.json();}catch{throw Error('PILOT_AUTH_OR_SERVICE_UNAVAILABLE');}
      if(!response.ok)throw Error(data?.error||'PILOT_REQUEST_FAILED');
      return data;
    }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
  }
  return {
    configured:!!base,
    async convert(file,{signal,question=''}={}){
      const form=new FormData();form.append('file',file,file.name);form.append('question',question);
      const data=await call('/convert',form,signal);
      if(!data?.document||typeof data.document.text!=='string'||!data.document.text.trim()||typeof data.document.receipt!=='string')throw Error('NO_EXTRACTED_TEXT');
      return data.document;
    },
    async analyze({question,documents,history,lang,signal,publicCorpusQuery='',corpusConsent=false}){
      const data=await call('/analyze',{question,documents,history,lang,publicCorpusQuery,corpusConsent},signal);
      if(typeof data?.answer!=='string'||!Array.isArray(data.coverage))throw Error('INVALID_PILOT_RESPONSE');
      return data;
    },
    async suggest({question,history,lang,signal}){
      const data=await call('/suggest',{question,history,lang},signal);
      if(!Array.isArray(data?.suggestions)||data.suggestions.length!==3||data.suggestions.some(s=>typeof s!=='string'))throw Error('INVALID_SUGGESTIONS');
      return data.suggestions;
    }
  };
}
