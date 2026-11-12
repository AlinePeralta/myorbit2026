"use strict";

(() => {
  const source = document.querySelector("#chat-data");
  if (!source) return;
  const { contacts, parentName, parentAvatar } = JSON.parse(source.textContent);
  const storageKey = "myorbit-chat-preview-v5";
  let threads = Object.create(null);
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || "{}");
    for (const contact of contacts) {
      const messages = saved?.[contact.id];
      if (Array.isArray(messages))
        threads[contact.id] = messages
          .filter(
            (message) =>
              typeof message?.text === "string" &&
              message.text.trim() &&
              message.text.length <= 2000 &&
              Number.isFinite(message.time) &&
              Math.abs(message.time) < 8640000000000000,
          )
          .slice(-100);
    }
  } catch {
    /* Storage is optional in the prototype. */
  }

  const clock = (time) =>
    new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
    }).format(time);
  const day = (time) =>
    new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
      time,
    );

  function updateList() {
    const list = document.querySelector(".conversation-list");
    if (!list) return;
    for (const row of list.children) {
      const messages = threads[row.dataset.contactId] || [];
      if (!messages.length) continue;
      const last = messages.at(-1);
      row.querySelector("[data-conversation-preview]").textContent = last.text;
      const time = row.querySelector("[data-conversation-time]");
      time.textContent = day(last.time);
      time.dateTime = new Date(last.time).toISOString();
    }
    [...list.children]
      .sort(
        (a, b) =>
          (threads[b.dataset.contactId]?.at(-1)?.time || 0) -
          (threads[a.dataset.contactId]?.at(-1)?.time || 0),
      )
      .forEach((row) => list.append(row));
  }

  document
    .querySelector('[data-action="new-conversation"]')
    ?.addEventListener("click", async () => {
      let selected = null;
      const content = document.createElement("div");
      content.className = "chat-picker";
      const label = document.createElement("label");
      label.htmlFor = "contact-search";
      label.textContent = "Choose a teacher";
      const search = document.createElement("input");
      search.type = "search";
      search.id = "contact-search";
      search.placeholder = "Search teachers…";
      search.autocomplete = "off";
      const group = document.createElement("div");
      group.className = "chat-picker-list";
      group.setAttribute("role", "radiogroup");
      group.setAttribute("aria-label", "Teachers");
      const empty = document.createElement("p");
      empty.textContent = "No teachers found.";
      empty.hidden = true;
      const count = document.createElement("p");
      count.className = "sr-only";
      count.setAttribute("role", "status");
      for (const contact of contacts) {
        const option = document.createElement("label");
        option.className = "chat-contact-option";
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "chat-contact";
        radio.value = contact.id;
        const avatar = document.createElement("img");
        avatar.src = contact.avatar;
        avatar.alt = "";
        avatar.className = "avatar";
        const copy = document.createElement("span");
        const name = document.createElement("strong");
        name.textContent = contact.name;
        const role = document.createElement("span");
        role.textContent = contact.role;
        copy.append(name, role);
        option.append(radio, avatar, copy);
        group.append(option);
        radio.addEventListener("change", () => {
          selected = contact.id;
          Swal.resetValidationMessage();
        });
      }
      search.addEventListener("input", () => {
        let visible = 0;
        const term = search.value.trim().toLocaleLowerCase();
        [...group.children].forEach((option) => {
          option.hidden = !option.textContent
            .toLocaleLowerCase()
            .includes(term);
          if (!option.hidden) visible++;
          if (option.hidden && option.querySelector("input").checked) {
            option.querySelector("input").checked = false;
            selected = null;
          }
        });
        empty.hidden = visible !== 0;
        count.textContent = `${visible} teachers found`;
      });
      content.append(label, search, group, empty, count);
      const result = await Swal.fire({
        title: "New conversation",
        html: content,
        showCancelButton: true,
        confirmButtonText: "Open conversation",
        cancelButtonText: "Cancel",
        focusConfirm: false,
        buttonsStyling: false,
        showClass: { popup: "" },
        hideClass: { popup: "" },
        customClass: {
          popup: "orbit-alert chat-alert",
          confirmButton: "button-primary",
          cancelButton: "button-secondary",
        },
        didOpen: () => search.focus(),
        preConfirm: () => {
          if (!selected) {
            Swal.showValidationMessage("Choose a teacher to continue.");
            return false;
          }
          return selected;
        },
      });
      if (result.isConfirmed)
        location.href = `conversation.html?contact=${encodeURIComponent(result.value)}`;
    });

  updateList();
  const form = document.querySelector("#message-form");
  if (!form) return;
  const id = new URLSearchParams(location.search).get("contact") || "margaret";
  const contact = contacts.find((contact) => contact.id === id);
  const messages = document.querySelector("#messages");
  const input = document.querySelector("#message-input");
  const send = document.querySelector('[data-action="send-message"]');
  const feedback = document.querySelector("#chat-feedback");
  const header = document.querySelector(".header-title");
  const empty = document.querySelector("#chat-empty");
  if (!contact) {
    header.querySelector("h1").textContent = "Conversation unavailable";
    header.querySelector("p").textContent = "Choose a contact from Chat.";
    messages.replaceChildren();
    form.hidden = true;
    return;
  }
  document.title = `${contact.name} · Chat`;
  header.querySelector("h1").textContent = `${parentName} — ${contact.name}`;
  header.querySelector("p").textContent =
    `${contact.role} · Preview conversation`;
  messages.setAttribute("aria-label", `Conversation with ${contact.name}`);
  if (id !== "margaret") messages.replaceChildren();
  function renderMessage(message) {
    const article = document.createElement("article");
    article.className = "message outgoing";
    article.setAttribute("aria-label", "Outgoing message preview");
    const avatar = document.createElement("img");
    avatar.src = parentAvatar;
    avatar.alt = "";
    avatar.className = "avatar avatar-sm";
    const copy = document.createElement("div");
    copy.className = "message-copy";
    const bubble = document.createElement("p");
    bubble.className = "bubble";
    bubble.textContent = message.text;
    const time = document.createElement("time");
    time.dateTime = new Date(message.time).toISOString();
    time.textContent = `${clock(message.time)} · Preview`;
    copy.append(bubble, time);
    article.append(avatar, copy);
    messages.append(article);
    empty.hidden = true;
    return article;
  }
  for (const message of threads[id] || []) renderMessage(message);
  empty.hidden = messages.children.length > 0;
  input.addEventListener("input", () => {
    send.disabled = !input.value.trim();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text || text.length > 2000) return;
    const message = { text, time: Date.now() };
    threads[id] = [...(threads[id] || []), message].slice(-100);
    let kept = true;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(threads));
    } catch {
      kept = false;
    }
    const article = renderMessage(message);
    input.value = "";
    send.disabled = true;
    feedback.textContent = kept
      ? "Preview added. No message was sent to the teacher."
      : "Preview added for this page only. No message was sent.";
    article.scrollIntoView({ behavior: "instant", block: "center" });
    input.focus({ preventScroll: true });
  });
})();
