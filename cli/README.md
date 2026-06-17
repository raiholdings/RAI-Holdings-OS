# rai-mcp-publisher

Internal CLI for the **RAI MCP Registry** (`/mcp`). Modeled on `mcp-publisher`.
No dependencies — Node 18+ (uses global `fetch`).

## Usage

```bash
# create a server.json template
node cli/rai-mcp-publisher.mjs init vn.rai/my-server

# log in (vn.rai/* → rai_… token · io.github.* → ghp_… token)
node cli/rai-mcp-publisher.mjs login rai_demo_token --registry http://localhost:4173

# publish ./server.json
node cli/rai-mcp-publisher.mjs publish

# who am I
node cli/rai-mcp-publisher.mjs whoami
```

Or via npm: `npm run rai-mcp -- <command>` (note the `--`).

## Config

- Credentials are stored in `~/.rai-mcp/credentials.json`.
- Registry URL resolves from `--registry`, then `$RAI_MCP_REGISTRY`, then `http://localhost:4173`.
- `publish` POSTs your `server.json` to `<registry>/api/mcp/v0/publish` with `Authorization: Bearer <token>`.

## Notes

Namespace auth mirrors the registry: `vn.rai/*` requires a `rai_…` token (RAI OAuth + DNS TXT
Ed25519, simulated) and RAI-domain remotes; `io.github.*` requires a `ghp_…` GitHub token.
The registry stores **metadata only** — installation still happens via npm/PyPI/GitHub releases.
