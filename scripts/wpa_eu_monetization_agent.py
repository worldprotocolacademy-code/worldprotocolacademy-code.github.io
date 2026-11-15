#!/usr/bin/env python3
"""WPA monetization proactive *advisory* agent, zero external actions.

Weekly workflow emits a readiness report for three P0 projects from public
first-party planning metadata. No invented costs, pricing, turnover or offers.
"""
from __future__ import annotations
import argparse
import datetime as dt
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
REGISTRY=ROOT/'data/eu-application-factory/monetization-plan-v1.json'

def readiness(registry):
 baseline=registry['baseline']
 income=baseline.get('actualCollectedRevenueEUR')
 if income is None: income_status='NOT_REPORTED'
 elif isinstance(income,(int,float)) and not isinstance(income,bool) and income>=0: income_status='USER_SUPPLIED_UNVERIFIED'
 else: raise ValueError('Invalid revenue metric')
 legal=bool(baseline.get('legalEntityDocuments'))
 payments=baseline.get('paymentsActivated') is True
 actions=[]
 for p in registry['projectQueues']:
  if p.get('legalApplicant')!='VERIFIED' or not legal:
   actions.append({'project':p['id'],'priority':'BLOCKING','action':'Identify eligible registered contracting entity and verify legal records'})
  actions.append({'project':p['id'],'priority':'RESEARCH','action':'Validate demand and documented price/cost assumptions without soliciting payment'})
  if p['id']=='wpa_journal':
   actions.append({'project':p['id'],'priority':'ETHICS','action':'Verify separation of any sponsor from peer review and article acceptance'})
  if p['id']=='ohrid_2027':
   actions.append({'project':p['id'],'priority':'FINANCE','action':'Reconcile hotel costs, sponsorship and grants to prevent double funding'})
 return {'schema':'wpa-eu-monetization-proactive-run/1','generatedAt':dt.datetime.now(dt.timezone.utc).isoformat(),
  'state':'RESEARCH_AND_PLANNING_ONLY','source':str(REGISTRY.relative_to(ROOT)),
  'projects':[{'id':p['id'],'title':p['title'],'revenueCandidates':p['revenueStreams'],
               'grantBoundary':p['grantPosition'],'commercialStatus':'NOT_ACTIVE'} for p in registry['projectQueues']],
  'financialEvidence':{'actualCollectedRevenueEUR':income,'status':income_status,
                       'validatedPrices':baseline.get('approvedPrices') is not None,
                       'verifiedCosts':baseline.get('verifiedFixedCosts') is not None},
  'activationAllowed':False,'paymentsConfigured':payments,
  'blockingGates':registry['mandatoryHumanGates'],'proactiveRecommendations':actions,
  'externalProviderCalls':0,'emailsSent':0,'invoicesCreated':0,'contractsSigned':0,
  'note':'A scheduler run creates an internal review artifact. No external AI models ran or generated revenue.'}

def build():
 registry=json.loads(REGISTRY.read_text(encoding='utf8'))
 if registry['schema']!='wpa-eu-monetization-portfolios/1':raise ValueError('invalid registry schema')
 if len(registry['projectQueues'])!=3:raise ValueError('priority0 count changed')
 return readiness(registry)

def main():
 p=argparse.ArgumentParser()
 p.add_argument('--output',type=Path)
 p.add_argument('--self-test',action='store_true')
 args=p.parse_args()
 report=build()
 if args.self_test:
  assert report['activationAllowed'] is False
  assert report['financialEvidence']['actualCollectedRevenueEUR'] is None
  assert report['externalProviderCalls']==0
  print('MONETIZATION_AGENT_READ_ONLY_SELF_TEST_PASS')
  return
 if args.output:
  args.output.parent.mkdir(parents=True,exist_ok=True)
  args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 print(json.dumps({'projects':len(report['projects']),'state':report['state'],'externalProviderCalls':0,'activationAllowed':False}))

if __name__=='__main__':main()