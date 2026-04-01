(function () {
  const cfg = window.DB_CHATBOT_CONFIG || {};
  const API_URL = (cfg.apiUrl || "http://localhost:8000").replace(/\/$/, "");
  const TITLE = cfg.title || "Data Assistant";
  const ACCENT = cfg.accentColor || "#6366f1";
  const POSITION = cfg.position || "bubble";
  const AVATAR_LETTER = (TITLE[0] || "A").toUpperCase();

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

    .dbc-wrap {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      font-family: 'DM Sans', -apple-system, sans-serif;
      overflow: hidden;
      background: #0f0f13;
    }

    .dbc-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: #1a1a24;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      flex-shrink: 0;
    }

    .dbc-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: ${ACCENT};
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 15px;
      color: #fff;
      flex-shrink: 0;
      position: relative;
    }

    .dbc-avatar-dot {
      position: absolute;
      bottom: 1px;
      right: 1px;
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #22c55e;
      border: 2px solid #1a1a24;
    }

    .dbc-header-info { flex: 1; min-width: 0; }
    .dbc-header-name {
      font-weight: 600;
      font-size: 14px;
      color: #f1f1f3;
    }
    .dbc-header-status {
      font-size: 11px;
      color: #22c55e;
      margin-top: 1px;
    }

    .dbc-sql-toggle {
      background: rgba(255,255,255,0.07);
      border: none;
      border-radius: 8px;
      color: #9999bb;
      font-size: 11px;
      font-family: 'DM Sans', sans-serif;
      padding: 5px 10px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .dbc-sql-toggle:hover { background: rgba(255,255,255,0.12); color: #fff; }
    .dbc-sql-toggle.on { background: rgba(99,102,241,0.25); color: ${ACCENT}; }

    .dbc-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-height: 0;
      scrollbar-width: thin;
      scrollbar-color: #2a2a3a transparent;
    }
    .dbc-messages::-webkit-scrollbar { width: 4px; }
    .dbc-messages::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 4px; }

    .dbc-divider {
      text-align: center;
      font-size: 11px;
      color: #44445a;
      margin: 8px 0;
      letter-spacing: 0.04em;
    }

    .dbc-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      animation: dbcIn 0.18s ease;
    }
    @keyframes dbcIn {
      from { opacity: 0; transform: translateY(5px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .dbc-row.user { flex-direction: row-reverse; }

    .dbc-row-av {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: ${ACCENT};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
      margin-bottom: 18px;
    }

    .dbc-group { display: flex; flex-direction: column; gap: 2px; max-width: 76%; }
    .dbc-row.user .dbc-group { align-items: flex-end; }

    .dbc-bubble {
      padding: 9px 13px;
      border-radius: 18px;
      font-size: 13.5px;
      line-height: 1.55;
      word-break: break-word;
    }
    .dbc-row.user .dbc-bubble {
      background: ${ACCENT};
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .dbc-row.bot .dbc-bubble {
      background: #1e1e2e;
      color: #ddddf0;
      border-bottom-left-radius: 4px;
      border: 1px solid rgba(255,255,255,0.06);
    }

    .dbc-meta {
      font-size: 10px;
      color: #44445a;
      padding: 0 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .dbc-row.user .dbc-meta { flex-direction: row-reverse; }
    .dbc-tick { color: #22c55e; }

    .dbc-sql-block {
      margin-top: 4px;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid rgba(99,102,241,0.3);
      display: none;
    }
    .dbc-sql-block.visible { display: block; }
    .dbc-sql-top {
      background: rgba(99,102,241,0.15);
      padding: 5px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }
    .dbc-sql-label { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; color: ${ACCENT}; text-transform: uppercase; }
    .dbc-sql-arrow { font-size: 9px; color: ${ACCENT}; transition: transform 0.2s; }
    .dbc-sql-arrow.open { transform: rotate(180deg); }
    .dbc-sql-code {
      display: none;
      background: #080810;
      padding: 10px 13px;
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 11.5px;
      color: #a5b4fc;
      white-space: pre-wrap;
      word-break: break-all;
      line-height: 1.6;
    }

    .dbc-typing-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      animation: dbcIn 0.18s ease;
    }
    .dbc-typing-bubble {
      background: #1e1e2e;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 18px;
      border-bottom-left-radius: 4px;
      padding: 12px 14px;
      display: flex;
      gap: 5px;
      align-items: center;
    }
    .dbc-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #5555aa;
      animation: dbcBounce 1.2s infinite;
    }
    .dbc-dot:nth-child(2) { animation-delay: 0.18s; }
    .dbc-dot:nth-child(3) { animation-delay: 0.36s; }
    @keyframes dbcBounce {
      0%,60%,100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-5px); opacity: 1; }
    }

    .dbc-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 0 14px 10px;
      flex-shrink: 0;
    }
    .dbc-chip {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 5px 12px;
      font-size: 12px;
      color: #9999cc;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .dbc-chip:hover { background: rgba(99,102,241,0.2); border-color: ${ACCENT}; color: #fff; }

    .dbc-input-bar {
      padding: 10px 14px;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: flex;
      gap: 10px;
      align-items: center;
      background: #1a1a24;
      flex-shrink: 0;
    }

    .dbc-input {
      flex: 1;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 22px;
      padding: 9px 16px;
      font-size: 13.5px;
      font-family: 'DM Sans', sans-serif;
      color: #f1f1f3;
      outline: none;
      transition: border-color 0.2s;
    }
    .dbc-input::placeholder { color: #44445a; }
    .dbc-input:focus { border-color: ${ACCENT}; }

    .dbc-send {
      width: 38px; height: 38px;
      border-radius: 50%;
      background: ${ACCENT};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.15s, opacity 0.2s;
    }
    .dbc-send:hover { transform: scale(1.08); }
    .dbc-send:active { transform: scale(0.94); }
    .dbc-send:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
    .dbc-send svg { width: 15px; height: 15px; fill: #fff; }

    #dbc-launcher {
      position: fixed;
      bottom: 24px; right: 24px;
      width: 58px; height: 58px;
      border-radius: 50%;
      background: ${ACCENT};
      border: none;
      cursor: pointer;
      box-shadow: 0 8px 28px rgba(99,102,241,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      transition: transform 0.2s;
    }
    #dbc-launcher:hover { transform: scale(1.08); }
    #dbc-launcher svg { width: 24px; height: 24px; fill: #fff; }

    #dbc-window {
      position: fixed;
      bottom: 96px; right: 24px;
      width: 390px; height: 600px;
      border-radius: 20px;
      background: #0f0f13;
      box-shadow: 0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06);
      display: flex;
      flex-direction: column;
      z-index: 9998;
      overflow: hidden;
      transition: opacity 0.22s, transform 0.22s;
      transform-origin: bottom right;
    }
    #dbc-window.dbc-hidden {
      opacity: 0;
      pointer-events: none;
      transform: scale(0.88) translateY(14px);
    }
  `;

  const styleEl = document.createElement("style");
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);

  function scrollToBottom(el) {
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }

  function timeNow() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function buildChat(container) {
    const chips = cfg.suggestions || ["How many records?", "Top 5 by revenue", "Show recent entries"];

    container.innerHTML = `
      <div class="dbc-wrap">
        <div class="dbc-header">
          <div class="dbc-avatar">${AVATAR_LETTER}<div class="dbc-avatar-dot"></div></div>
          <div class="dbc-header-info">
            <div class="dbc-header-name">${esc(TITLE)}</div>
            <div class="dbc-header-status">online · AI powered</div>
          </div>
          <button class="dbc-sql-toggle" id="dbc-sqltoggle">{ } SQL</button>
        </div>

        <div class="dbc-messages" id="dbc-messages">
          <div class="dbc-divider">Today</div>
          <div class="dbc-row bot">
            <div class="dbc-row-av">${AVATAR_LETTER}</div>
            <div class="dbc-group">
              <div class="dbc-bubble">Hey! Ask me anything about your data in plain English and I'll run the query for you.</div>
              <div class="dbc-meta">${timeNow()}</div>
            </div>
          </div>
        </div>

        <div class="dbc-chips" id="dbc-chips">
          ${chips.map(c => `<button class="dbc-chip">${esc(c)}</button>`).join("")}
        </div>

        <div class="dbc-input-bar">
          <input class="dbc-input" id="dbc-input" placeholder="Ask about your data…" autocomplete="off"/>
          <button class="dbc-send" id="dbc-send">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    `;

    const msgs   = container.querySelector("#dbc-messages");
    const input  = container.querySelector("#dbc-input");
    const sendBtn= container.querySelector("#dbc-send");
    const chipsEl= container.querySelector("#dbc-chips");
    const sqlBtn = container.querySelector("#dbc-sqltoggle");

    let showSQL = false;

    sqlBtn.addEventListener("click", () => {
      showSQL = !showSQL;
      sqlBtn.classList.toggle("on", showSQL);
      container.querySelectorAll(".dbc-sql-block").forEach(el => {
        el.classList.toggle("visible", showSQL);
      });
    });

    chipsEl.querySelectorAll(".dbc-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        input.value = chip.textContent;
        chipsEl.style.display = "none";
        send();
      });
    });

    function appendUserMsg(text) {
      const row = document.createElement("div");
      row.className = "dbc-row user";
      row.innerHTML = `
        <div class="dbc-group">
          <div class="dbc-bubble">${esc(text)}</div>
          <div class="dbc-meta">${timeNow()} <span class="dbc-tick">✓✓</span></div>
        </div>
      `;
      msgs.appendChild(row);
      scrollToBottom(msgs);
    }

    function appendBotMsg(text, sql) {
      const row = document.createElement("div");
      row.className = "dbc-row bot";

      let sqlHtml = "";
      if (sql) {
        sqlHtml = `
          <div class="dbc-sql-block${showSQL ? " visible" : ""}">
            <div class="dbc-sql-top">
              <span class="dbc-sql-label">Generated SQL</span>
              <span class="dbc-sql-arrow">▼</span>
            </div>
            <div class="dbc-sql-code">${esc(sql)}</div>
          </div>
        `;
      }

      row.innerHTML = `
        <div class="dbc-row-av">${AVATAR_LETTER}</div>
        <div class="dbc-group">
          <div class="dbc-bubble">${esc(text)}</div>
          ${sqlHtml}
          <div class="dbc-meta">${timeNow()}</div>
        </div>
      `;

      if (sql) {
        const top   = row.querySelector(".dbc-sql-top");
        const code  = row.querySelector(".dbc-sql-code");
        const arrow = row.querySelector(".dbc-sql-arrow");
        top.addEventListener("click", () => {
          const open = code.style.display === "block";
          code.style.display = open ? "none" : "block";
          arrow.classList.toggle("open", !open);
          scrollToBottom(msgs);
        });
      }

      msgs.appendChild(row);
      scrollToBottom(msgs);
    }

    function addTypingIndicator() {
      const el = document.createElement("div");
      el.className = "dbc-typing-row";
      el.id = "dbc-typing";
      el.innerHTML = `
        <div class="dbc-row-av">${AVATAR_LETTER}</div>
        <div class="dbc-typing-bubble">
          <div class="dbc-dot"></div>
          <div class="dbc-dot"></div>
          <div class="dbc-dot"></div>
        </div>
      `;
      msgs.appendChild(el);
      scrollToBottom(msgs);
      return el;
    }

    async function send() {
      const q = input.value.trim();
      if (!q) return;

      chipsEl.style.display = "none";
      appendUserMsg(q);
      input.value = "";
      sendBtn.disabled = true;

      const typing = addTypingIndicator();

      try {
        const res  = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q }),
        });
        const data = await res.json();
        typing.remove();

        if (data.error && !data.answer) {
          appendBotMsg("Sorry, something went wrong: " + data.error, null);
        } else {
          appendBotMsg(data.answer, data.sql || null);
        }
      } catch (e) {
        typing.remove();
        appendBotMsg("Connection failed — is the server running?", null);
      }

      sendBtn.disabled = false;
      input.focus();
    }

    sendBtn.addEventListener("click", send);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) send();
    });
  }

  if (POSITION === "inline" && document.getElementById("db-chatbot")) {
    const host = document.getElementById("db-chatbot");
    host.style.cssText = "width:100%;height:100%;overflow:hidden;border-radius:20px;";
    buildChat(host);
  } else {
    const launchBtn = document.createElement("button");
    launchBtn.id = "dbc-launcher";
    launchBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`;

    const win = document.createElement("div");
    win.id = "dbc-window";
    win.className = "dbc-hidden";

    document.body.appendChild(launchBtn);
    document.body.appendChild(win);
    buildChat(win);

    let open = false;
    launchBtn.addEventListener("click", () => {
      open = !open;
      win.classList.toggle("dbc-hidden", !open);
      if (open) win.querySelector("#dbc-input")?.focus();
    });
  }
})();