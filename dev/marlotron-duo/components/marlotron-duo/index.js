// Create the MarlotronDuo module
const MarlotronDuo = {
  async init(container) {
    try {
      // Load dependencies
      await this.loadDependencies();

      // Fetch and insert the template
      const response = await fetch("components/marlotron-duo/template.html");
      const html = await response.text();

      // Create a temporary div to hold the template
      const temp = document.createElement("div");
      temp.innerHTML = html;

      // Get the actual template content
      const template = temp.querySelector(".marlotron-duo");
      container.appendChild(template);

      // Initialize the interface now that template is loaded
      if (typeof initializeInterface === "function") {
        initializeInterface();
      } else {
        console.error("Interface initialization function not found");
      }
    } catch (error) {
      console.error("Error initializing MarlotronDuo:", error);
    }
  },

  async loadDependencies() {
    const scriptFileNames = [
      "audio-bridge.js",
      "interface.js",
      "synth-core.js",
      "dial.js",
    ];
    // Wait for all scripts to load
    await Promise.all(
      scriptFileNames.map((fileName) => {
        const script = document.createElement("script");
        script.src = `components/marlotron-duo/lib/${fileName}`;
        document.head.appendChild(script);
        return new Promise((resolve) => (script.onload = resolve));
      }),
    );
  },
};

// Export the module
window.MarlotronDuo = MarlotronDuo;
