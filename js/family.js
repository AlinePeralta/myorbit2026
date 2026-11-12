"use strict";

(() => {
  const source = document.querySelector("#family-data");
  if (!source) return;
  const family = JSON.parse(source.textContent);
  const params = new URLSearchParams(location.search);
  const children =
    params.get("family") === "multiple" ? family.allChildren : family.children;
  const multiple = children.length > 1;
  document.body.classList.toggle("family--single", !multiple);
  document.body.classList.toggle("family--multiple", multiple);
  const selected =
    children.find((c) => c.id === params.get("child")) ||
    children.find((c) => c.id === family.selectedId) ||
    children[0];
  const pickup = Boolean(document.querySelector("#pickup-time"));
  const allPickup = document.querySelector("[data-family-all]");

  document.querySelectorAll(".children-strip").forEach((strip) => {
    const all = strip.hasAttribute("data-family-all");
    strip.replaceChildren(
      ...children.map((child) => {
        const tile = document.createElement(all ? "div" : "button");
        tile.className = "child-option";
        tile.dataset.childId = child.id;
        if (!all) {
          tile.type = "button";
          tile.setAttribute("aria-pressed", "false");
        }
        const image = document.createElement("img");
        image.src = child.avatar;
        image.alt = "";
        image.className = "avatar";
        const label = document.createElement("strong");
        label.textContent = child.shortName;
        tile.append(image, label);
        return tile;
      }),
    );
  });
  const accountList = document.querySelector(".account-child-list");
  if (accountList) {
    accountList.replaceChildren(
      ...children.map((child) => {
        const link = document.createElement("a");
        link.className = "account-child";
        link.href = "profile.html";
        link.dataset.accountChild = child.id;
        const image = document.createElement("img");
        image.src = child.avatar;
        image.alt = "";
        image.className = "avatar";
        const copy = document.createElement("span");
        const name = document.createElement("strong");
        name.textContent = child.shortName;
        const group = document.createElement("span");
        group.className = "muted";
        group.textContent = child.group;
        copy.append(name, group);
        link.append(image, copy);
        return link;
      }),
    );
  }

  function contextLink(link, id) {
    const url = new URL(link.getAttribute("href"), location.href);
    url.searchParams.set("child", id);
    url.searchParams.set("family", multiple ? "multiple" : "single");
    link.setAttribute("href", url.pathname.split("/").pop() + url.search);
  }

  function selectChild(child, announce = false) {
    document.body.dataset.childId = child.id;
    document.body.dataset.selectedChildName = child.shortName;
    document
      .querySelectorAll("[data-child-name]")
      .forEach((el) => (el.textContent = child.name));
    document
      .querySelectorAll("[data-child-short]")
      .forEach((el) => (el.textContent = child.shortName));
    document
      .querySelectorAll("[data-child-group]")
      .forEach((el) => (el.textContent = child.group));
    document.querySelectorAll("[data-child-avatar]").forEach((el) => {
      el.src = child.avatar;
      el.alt = child.name;
    });
    document.querySelectorAll("[data-child-activity-image]").forEach((el) => {
      el.src = child.gallery[0];
      el.alt = `${child.shortName} during a classroom activity`;
    });
    document.querySelectorAll(".child-card .status-line").forEach((el) => {
      el.hidden = !child.checkedIn;
      el.lastElementChild.textContent = child.checkInTime;
    });
    document
      .querySelectorAll("button[data-child-id]")
      .forEach((el) =>
        el.setAttribute(
          "aria-pressed",
          String(el.dataset.childId === child.id),
        ),
      );
    document.querySelectorAll("a[href]").forEach((link) => {
      const file = new URL(link.href).pathname.split("/").pop();
      if (
        [
          "index.html",
          "index-multiple.html",
          "profile.html",
          "pickup.html",
          "pickup-multiple.html",
          "pickup-scheduled.html",
          "pickup-scheduled-multiple.html",
          "account.html",
          "account-multiple.html",
        ].includes(file)
      )
        contextLink(link, link.dataset.accountChild || child.id);
    });
    const gallery = document.querySelector(".gallery-main");
    if (gallery) {
      gallery.src = child.gallery[0];
      gallery.alt = `${child.shortName} — activity photo 1`;
      const thumbnails = document.querySelector(".thumbnails");
      thumbnails.replaceChildren(
        ...child.gallery.map((src, i) => {
          const button = document.createElement("button");
          button.type = "button";
          button.dataset.galleryIndex = i;
          button.dataset.src = src;
          button.setAttribute("aria-label", `Show photo ${i + 1}`);
          button.setAttribute("aria-pressed", String(i === 0));
          const image = document.createElement("img");
          image.src = src;
          image.alt = `Activity photo ${i + 1}`;
          button.append(image);
          return button;
        }),
      );
      document.querySelector(".gallery-count").textContent =
        `1 / ${child.gallery.length}`;
      document
        .querySelectorAll("[data-gallery-step]")
        .forEach((el) => (el.hidden = child.gallery.length < 2));
    }
    if (announce) {
      const url = new URL(location.href);
      url.searchParams.set("child", child.id);
      history.replaceState(null, "", url);
      document.querySelector("[data-child-announcement]").textContent =
        `${child.name} selected`;
    }
  }

  const announcement = document.createElement("p");
  announcement.className = "sr-only";
  announcement.setAttribute("role", "status");
  announcement.dataset.childAnnouncement = "";
  document.querySelector("#main").append(announcement);
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-child-id]");
    if (button) {
      const child = children.find((c) => c.id === button.dataset.childId);
      if (child) selectChild(child, true);
    }
  });
  if (pickup) {
    const title = document.querySelector("#pickup-title");
    const scope = document.querySelector("[data-pickup-scope]");
    function updatePickup() {
      const hasTime = Boolean(document.querySelector("#pickup-time").value);
      document.body.classList.toggle("pickup--scheduled", hasTime);
      title.textContent = hasTime
        ? multiple
          ? "Pick up time for all children"
          : "Pick up time"
        : "Select pickup time";
      scope.textContent = multiple
        ? `Applies to all ${children.length} children`
        : "Applies to 1 child";
    }
    document
      .querySelector("#pickup-time")
      .addEventListener("input", updatePickup);
    updatePickup();
    if (allPickup)
      allPickup.setAttribute(
        "aria-label",
        `Pickup applies to all ${children.length} children`,
      );
  }
  selectChild(selected);
})();
