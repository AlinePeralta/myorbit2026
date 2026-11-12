"use strict";

const pickupTime = document.querySelector("#pickup-time");
const pickupResult = document.querySelector("#pickup-result");

pickupTime.addEventListener("input", () => {
  const time = pickupTime.value;
  pickupTime.parentElement.classList.toggle("has-value", Boolean(time));
  pickupResult.hidden = !time;
  document.querySelector("#pickup-value").textContent = time;
});

pickupTime.parentElement.classList.toggle(
  "has-value",
  Boolean(pickupTime.value),
);
