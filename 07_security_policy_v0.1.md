# WPA Security Policy v0.1

## 1. Introduction (MK)

Оваа работна политика ја дефинира насоката за безбедносно управување на WPA платформата, корисничките податоци, сертификатите, AI системите и административните пристапи. Таа е документ за governance и readiness и не претставува тврдење за формална сертификација или целосна имплементација на секоја наведена контрола.

## 2. Organisation (MK)

Целниот модел на улоги вклучува: super_admin, content_manager, certification_officer, support_agent, viewer и security_auditor. Привилегираните административни сметки треба да користат силна автентикација и 2FA каде што системот го поддржува тоа.

## 3. Risk Management (MK)

Клучни ризици за следење се: неподдржани AI тврдења, лажни сертификати, компромитиран административен пристап, истекување податоци, плагијат, несоодветен институционален јазик и supply-chain ризици.

## 4. Control Objectives (MK)

Безбедносните цели на WPA вклучуваат HTTPS, HSTS каде што е технички применливо, role-based access control, криптографски хеширања, проверливи сертификати, шифрирани резервни копии каде што се користат, audit logging, контролирани AI одговори и дипломатски/институционален јазичен филтер. Секоја контрола треба да има сопствен доказ за имплементација пред да се смета за оперативно воспоставена.

## 5. Incident Response (MK)

Безбедносните инциденти треба да се евидентираат, проценат, ескалираат и затворат со audit trail. За инциденти со лични податоци се применува проценка на важечките GDPR обврски и рокови; не секој настан автоматски создава обврска за известување.

## 6. Compliance & Readiness (MK)

WPA работи кон усогласување и readiness со применливите барања на GDPR, ISO/IEC 27001:2022 и релевантните обврски од EU AI Act каде што се применливи. WPA не тврди ISO/IEC 27001 сертификација, TÜV сертификација или независна ревизија освен ако таков статус не е документарно потврден.

## 7. Review (MK)

Политиката се ревидира периодично и при значајна промена на ризик, инфраструктура или регулаторни барања. Роковите за SoA, DPIA, внатрешна ревизија и надворешна проценка се планирачки цели и треба да се потврдат во формален ISMS план.

---

## 1. Introduction (EN)

This working policy defines the security-governance direction for the WPA platform, user data, certificates, AI systems and administrative access. It is a governance and readiness document and does not claim formal certification or complete implementation of every listed control.

## 2. Organisation (EN)

The target role model includes: super_admin, content_manager, certification_officer, support_agent, viewer and security_auditor. Privileged administrative accounts should use strong authentication and 2FA where supported by the relevant system.

## 3. Risk Management (EN)

Key risks to monitor include unsupported AI claims, forged certificates, compromised administrator access, data leakage, plagiarism, inappropriate institutional language and software supply-chain risks.

## 4. Control Objectives (EN)

WPA security objectives include HTTPS, HSTS where technically applicable, role-based access control, cryptographic hashing, verifiable certificates, encrypted backups where used, audit logging, controlled AI responses and diplomatic/institutional language safeguards. Each control requires implementation evidence before it is treated as operationally established.

## 5. Incident Response (EN)

Security incidents should be logged, assessed, escalated and closed with an audit trail. Personal-data incidents require assessment against applicable GDPR notification obligations and deadlines; not every event automatically creates a notification duty.

## 6. Compliance & Readiness (EN)

WPA works toward alignment and readiness with applicable GDPR requirements, ISO/IEC 27001:2022 and relevant EU AI Act obligations where applicable. WPA does not claim ISO/IEC 27001 certification, TÜV certification or independent audit status unless that status is supported by documentary evidence.

## 7. Review (EN)

The policy is reviewed periodically and after material changes in risk, infrastructure or regulatory requirements. SoA, DPIA, internal-review and external-assessment dates are planning targets and should be confirmed through a formal ISMS plan.
