# Lucas + Clue Board

Local board + daily objectives with a tiny server (no extra deps).

## Start / Stop (easy commands)

```bash
cd /home/openclaw/.openclaw/workspace/board
./start
```

This auto-binds to your Tailscale IP and prints the URL.

Stop:

```bash
./stop
```

### Optional: custom port or bind

```bash
./start 8787 100.65.126.122
```

## Usage
- Click a card to edit
- ◀ / ▶ moves cards across columns
- ✕ deletes
- Daily Objectives has separate Lucas / Clue lists
- Click **Save** to persist changes to board.json

## Files
- `board.json` — all data
- `index.html` / `app.js` / `style.css` — UI
- `server.py` — tiny API + static file server
