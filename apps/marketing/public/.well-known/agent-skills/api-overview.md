---
name: api-overview
description: Explain the Pulse HR REST API, webhooks, and SDKs.
---

# Pulse HR API

REST API over HTTPS, JSON request/response, bearer-token auth via Clerk.
Every resource type (employees, timesheets, leave, expenses, payroll, docs,
custom fields) emits webhooks on create / update / delete.

SDKs: TypeScript, Python, Go — all generated from the public OpenAPI spec.

Reference: https://pulsehr.it/docs/api
Webhooks reference: https://pulsehr.it/docs/api#webhooks
Status page: https://status.pulsehr.it
