(() => {
  // The supplied frontend stays untouched. This bridge connects its existing
  // inline handlers to the backend API at runtime.

  window.handleFormSubmit = async function (event) {
    event.preventDefault();

    const form = event.target;
    const controls = [...form.querySelectorAll("input, textarea")];
    const values = controls.map(el => el.value.trim());

    const [name, email, subject, message] = values;

    if (!name || !email || !subject || !message) {
      triggerToast("All transmission fields are required.", "error");
      return;
    }

    const submit = form.querySelector('button[type="submit"]');
    const original = submit ? submit.innerHTML : "";

    if (submit) {
      submit.disabled = true;
      submit.innerHTML = "<span>Transmitting...</span>";
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message })
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Transmission failed.");
      }

      triggerToast("Transmission delivered to Shreeyam.", "success");
      form.reset();
    } catch (error) {
      console.error(error);
      triggerToast(error.message || "Transmission failed. Try again.", "error");
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.innerHTML = original;
      }
    }
  };

  // Convert the existing resume placeholder into a real backend download.
  document.addEventListener("DOMContentLoaded", () => {
    const resume = [...document.querySelectorAll("a.sigil-btn")]
      .find(el => el.textContent.toLowerCase().includes("download resume"));

    if (resume) {
      resume.href = "/resume.pdf";
      resume.removeAttribute("onclick");
      resume.removeAttribute("href");
      resume.addEventListener("click", event => {
        event.preventDefault();
        window.location.href = "/resume.pdf";
      });
    }
  });
})();
