  # Screenpipe API — Quick Reference

  REST API at `http://localhost:3030`. Auth required on ALL requests (except /health):
  curl -H "Authorization: Bearer $SCREENPIPE_LOCAL_API_KEY" "http://localhost:3030/..."

  **Context protection**: Always `curl ... -o /tmp/sp_result.json`, check size, use `jq` to extract. Never dump large responses into context.

  ## Search — GET /search
  /search?content_type=all&limit=10&start_time=1h%20ago
  Key params: `q` (keywords — skip for audio), `content_type` (all|accessibility|audio|ocr|ui|memory), `limit` (max 20), `start_time` (**required**, ISO 8601 or relative like `2h ago`), `end_time`, `app_name`, `window_name`,
  `speaker_name`.

  **Rules**: Always include `start_time`. Start with 1-2h ranges. Keep limit 5-10. "recent" = 30min, "today" = since midnight.

  ## Escalation Order (use lightest first)
  1. `GET /memories?q=...` — highest signal, always try first/parallel
  2. `GET /activity-summary?start_time=...&end_time=...` — "what was I doing?" questions
  3. `GET /search?...` — specific content
  4. `GET /elements?q=...&start_time=...` — UI elements (buttons, links)
  5. `GET /frames/{frame_id}` — screenshots (max 2-3)

  ## Activity Summary — GET /activity-summary
  /activity-summary?start_time=1h%20ago&end_time=now
  Returns apps with `active_minutes`, windows with titles/URLs/time, key texts, audio transcriptions. Usually enough without /search.

  ## Other Key Endpoints
  - `POST /frames/export` — video export: `{"start_time":"5m ago","end_time":"now","fps":1.0}`
  - `POST /raw_sql` — `{"query":"SELECT ... LIMIT 100"}` (always LIMIT, always filter by time)
  - `GET /meetings?start_time=...&limit=10` — detected meetings
  - `GET /connections` — connected services (Telegram, Slack, etc)
  - `POST http://localhost:11435/notify` — desktop notifications: `{"title":"...","body":"..."}` (markdown supported, port 11435 not 3030)
  - `POST /audio/retranscribe` — `{"start":"1h ago","end":"now"}`, optional `engine`, `vocabulary`

  ## Deep Links
  label              # screen results
  label     # audio results

  Full API docs: https://docs.screenpi.pe/llms-full.txt
