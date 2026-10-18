# Experimental Minecraft Bedrock Chat Bot (Railway)

This is a best-effort starter project, **not a verified working bot**. Bedrock protocol support, the server's exact version, Aternos availability, and the chat packet shape must be tested before relying on it.

## Defaults
- Server: `homelandreunion.aternos.me`
- Port: `55208`
- Username: `ChatBot123`
- Protocol version: `1.26.3`
- Random chat message every 40 seconds
- 10 default messages
- Reconnect attempt after disconnect

## Railway deployment from Android
1. Upload these files to a GitHub repository.
2. In Railway, create a project and deploy from that GitHub repository.
3. Set these variables in Railway's service variables:
   - `MC_HOST` = `homelandreunion.aternos.me`
   - `MC_PORT` = `55208`
   - `BOT_USERNAME` = `ChatBot123`
   - `MC_VERSION` = `1.26.3`
   - `MESSAGE_INTERVAL_MS` = `40000`
4. Deploy and read the logs. If the protocol version is rejected or it cannot connect, this project is not compatible as configured.

## Customize messages
Set `BOT_MESSAGES` to 10 messages separated by `|`, for example:
`BOT_MESSAGES=Hello!|Anyone online?|Nice build!|Have fun!|Welcome!|Keep exploring!|How is it going?|Good game!|Anyone building?|See you!`

Avoid putting `|` inside an individual message.

## Important limitations
- `offline: true` only attempts offline/cracked-style protocol login; it does not bypass server configuration, allowlist, or authentication requirements.
- Aternos must already be online. The bot cannot start an offline Aternos server.
- Free Railway usage and uptime are not guaranteed. A continuously running worker may consume paid usage or stop when credits are exhausted.
- The current protocol version and outbound chat packet may need adjustment for Bedrock 26.3. No live connection test was performed from the package creation environment.
- Only run this on a server where you have permission to connect a bot, and avoid chat spam.
