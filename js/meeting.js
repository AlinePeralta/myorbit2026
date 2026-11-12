"use strict";

const meetingForm = document.querySelector("#meeting-form");

meetingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!meetingForm.reportValidity()) return;

  const values = new FormData(meetingForm);
  const details = document.createElement("dl");
  details.className = "meeting-review";

  for (const [label, field] of [
    ["Teacher", "teacher"],
    ["Description", "description"],
    ["Date", "date"],
    ["Time", "time"],
  ]) {
    const term = document.createElement("dt");
    term.textContent = label;
    const definition = document.createElement("dd");
    definition.textContent = values.get(field);
    details.append(term, definition);
  }

  Swal.fire({
    title: "Meet the Teacher",
    showClass: { popup: "" },
    hideClass: { popup: "" },
    html: details,
    confirmButtonText: "Close",
    buttonsStyling: false,
    customClass: {
      popup: "orbit-alert",
      confirmButton: "button-primary",
    },
  });
});
