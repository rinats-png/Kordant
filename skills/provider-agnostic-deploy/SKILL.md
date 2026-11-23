---
name: provider-agnostic-deploy
description: Provider-neutral, evidence-gated staging and deployment planning across VPS, container hosts, PaaS, Kubernetes, bare metal or local environments.
---
# Provider-agnostic Deployment

## Input
- Selected platform profile under `infra/profiles/`, without credentials or hardcoded vendor domains
- Inventory of DNS, network, TLS, reverse proxy, container runtime, volumes, databases, external services and traffic
- Immutable build digest, configuration manifest, signed operator approval, restore and rollforward strategy

## Steps
1. Inspect read-only infrastructure status and record unknown services as UNKNOWN, never PASSED.
2. Choose platform adapter by declared capabilities, never by assumptions based on a provider name.
3. Validate configuration, tenant isolation, secret handling, backup/restore, data residency and resource limits.
4. Rehearse on staging with anonymized/test data, collect actual test results and screenshots where relevant.
5. Produce a versioned change plan with impact window, owner, rollback threshold and post-change verification.
6. Stop before changing production; require externally verified operator identity and independently checked release evidence.

## Hard boundaries
- No DNS modifications, SSH commands, credential access, restarts, migrations or productive data transfers by default.
- Unknown platform capabilities are not silently inferred.
- No production deployment from an LLM-only statement or local self-attested approval.
