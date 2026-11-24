// Conservative completeness check. Not a factual-accuracy or citation verifier.
const DANGLING=new Set(['кога','ако','бидејќи','доколку','затоа','дека','додека','и','или','но','со','за','во','на','од','кои','која','кое','кој','при','меѓу','when','if','because','while','although','and','or','but','with','from','to','the','of','which','who']);
export const CORE_OUTPUT_TOKEN_BUDGET=640;
export function isIncompleteAnswer(answer,metadata={}){
 const reason=String(metadata?.finish_reason||metadata?.stop_reason||metadata?.choices?.[0]?.finish_reason||'').toLowerCase();
 if(['length','max_tokens','max_output_tokens','token_limit'].includes(reason)||metadata?.answerCompleteness==='incomplete')return true;
 const text=String(answer||'').trim();
 if(text.length<24||/[.!?…)\]”»"']$/u.test(text))return false;
 const tail=text.match(/[\p{L}]+$/u)?.[0]?.toLowerCase();
 return Boolean(tail&&DANGLING.has(tail));
}
