import test from 'node:test';
import assert from 'node:assert/strict';
import { CANONICAL_CHAIN, REQUIRED_GATES, evaluateDoctrineAlignment, buildDoctrineReview, requestDoctrineChange } from './wpa-doctrine-kernel.mjs';

const aligned=()=>({command_chain:CANONICAL_CHAIN,gates:REQUIRED_GATES,automatic_publication:false,sande_human_approval_required:true,authorial_corpus_verified:true});

test('accepts the exact constitutional chain and gates',()=>assert.equal(evaluateDoctrineAlignment(aligned()).status,'aligned'));
test('blocks command chain drift',()=>{const x=aligned();x.command_chain=['gpt','virtual_sande'];assert.equal(evaluateDoctrineAlignment(x).status,'blocked_pending_sande_review');});
test('blocks automatic publication and missing Sande approval',()=>{const x=aligned();x.automatic_publication=true;x.sande_human_approval_required=false;assert.equal(evaluateDoctrineAlignment(x).violations.length>=2,true);});
test('requires verified corpus for authorial DNA check',()=>{const x=aligned();x.authorial_corpus_verified=false;assert.equal(buildDoctrineReview('test',x).alignment.status,'warning');});
test('never auto-applies doctrine changes',()=>{const x=requestDoctrineChange({field:'canonical_chain'});assert.equal(x.applied,false);assert.equal(x.approval_status,'sande_review_required');});
