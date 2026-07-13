/**
 * Non-blocking async confirmation modal.
 * Replaces the synchronous browser confirm() which causes INP/jank.
 * Returns a Promise<boolean> — resolves true on confirm, false on cancel.
 * @param {string} message 
 * @returns {Promise<boolean>}
 */
export function showConfirm(message) {
  return new Promise((resolve) => {
    // Pehle se koi modal open ho to remove karein
    const existing = document.getElementById("sk-confirm-modal");
    if (existing) existing.remove();

    // Backdrop overlay element
    const backdrop = document.createElement("div");
    backdrop.id = "sk-confirm-modal";
    backdrop.className = "sk-modal-backdrop";

    // Dialog box
    const dialog = document.createElement("div");
    dialog.className = "sk-modal-dialog";
    dialog.setAttribute("role", "alertdialog");
    dialog.setAttribute("aria-modal", "true");

    // Message text
    const msg = document.createElement("p");
    msg.className = "sk-modal-message";
    msg.textContent = message;

    // Button row
    const actions = document.createElement("div");
    actions.className = "sk-modal-actions";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "sk-modal-btn sk-modal-btn-cancel";
    cancelBtn.textContent = "Cancel";

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "sk-modal-btn sk-modal-btn-confirm";
    confirmBtn.textContent = "Confirm";

    // Cleanup and resolve helper
    const close = (result) => {
      backdrop.classList.remove("show");
      setTimeout(() => {
        backdrop.remove();
      }, 200);
      resolve(result);
    };

    cancelBtn.addEventListener("click", () => close(false));
    confirmBtn.addEventListener("click", () => close(true));

    // Backdrop click = cancel
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) close(false);
    });

    // Escape key = cancel
    const onKey = (e) => {
      if (e.key === "Escape") {
        window.removeEventListener("keydown", onKey);
        close(false);
      }
      if (e.key === "Enter") {
        window.removeEventListener("keydown", onKey);
        close(true);
      }
    };
    window.addEventListener("keydown", onKey);

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);
    dialog.appendChild(msg);
    dialog.appendChild(actions);
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);

    // Animate in on next frame so CSS transitions fire
    requestAnimationFrame(() => {
      backdrop.classList.add("show");
      confirmBtn.focus();
    });
  });
}
