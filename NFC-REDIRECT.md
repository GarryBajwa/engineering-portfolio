# NFC Redirect Manager

Permanent NFC URL:

`https://bajwa95.github.io/engineering-portfolio/go/`

Admin page:

`https://bajwa95.github.io/engineering-portfolio/admin/`

## How it works

1. The NFC tag always opens `/go/`.
2. `/go/` reads `go/config.json` through the public GitHub API.
3. It redirects the browser to the active target.
4. `/admin/` can update `go/config.json` through the GitHub Contents API.

## Admin security

The admin page does not contain or store a GitHub token.

When changing the target, paste a **fine-grained personal access token** that:
- is limited to this repository only
- has **Contents: Read and write**
- has no additional permissions unless separately needed

The token remains only in the page input during that session and is cleared after a successful save.
