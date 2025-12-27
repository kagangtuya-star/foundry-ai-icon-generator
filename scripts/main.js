import { registerSettings } from "./settings.js";
import { VanGoghWorkbench } from "./workbench.js";

Hooks.once("init", () => {
  registerSettings();
});

Hooks.on("renderJournalDirectory", (app, html) => {
  if (!game.user.isGM) return;

  // Ensure html is a jQuery object
  const $html = html instanceof jQuery ? html : $(html);

  const button = $(`<button class="van-gogh-btn"><i class="fas fa-paint-brush"></i> Van Gogh</button>`);
  button.on("click", (event) => {
    event.preventDefault();
    new VanGoghWorkbench().render(true);
  });

  $html.find(".directory-header .action-buttons").append(button);
});
