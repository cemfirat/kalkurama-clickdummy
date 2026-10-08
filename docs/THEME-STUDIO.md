# Theme Studio

Theme Studio is the local LESS editing surface embedded in the Styleguide.

Start:

```bash
npm install
npm run studio
```

Open:

`http://127.0.0.1:5173/styleguide.html`

## Safety boundary

Theme Studio:

- exists only in the Vite development server
- binds explicitly to `127.0.0.1`
- accepts loopback requests only
- writes only allowlisted Kalkurama/customer `.less` files
- keeps `src/themes/standard.less` read-only
- validates affected themes with Less before accepting a save
- rolls invalid writes back
- exposes Git status/diff but does not commit or push
- contains no GitHub credentials.

Git/CI integration is a later separate layer.

Permanent rule:

**No PR before green branch CI.**
