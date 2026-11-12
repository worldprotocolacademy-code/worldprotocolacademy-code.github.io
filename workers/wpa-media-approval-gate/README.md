# WPA Media Approval Gate

Status: **DISABLED BY DEFAULT**

Purpose: secure one-click Human Gate endpoint for WPA Media release objects.

## Required before activation

1. Create a dedicated KV namespace and bind it as `WPA_MEDIA_APPROVAL_AUDIT`.
2. Store `WPA_MEDIA_APPROVAL_HMAC_SECRET` as a Worker secret.
3. Configure `GITHUB_DISPATCH_URL` for the approved render workflow dispatch endpoint.
4. Store a least-privilege `GITHUB_DISPATCH_TOKEN` as a Worker secret.
5. Set `WPA_MEDIA_APPROVAL_MODE=ENABLED` only after staging tests pass.
6. Keep `workers_dev=false` until an intentional route/domain is approved.

## Security properties

- one exact release ID;
- script SHA-256 binding;
- manifest SHA-256 binding;
- token expiry;
- one-use token ID stored in KV;
- no repository credential embedded in approval links;
- fail closed when audit storage or secrets are absent.

This Worker records approval; it does not itself publish video or social content.
