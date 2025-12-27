import { VanGoghApi } from "./api.js";

export class VanGoghWorkbench extends Application {
  constructor(options) {
    super(options);
    this.items = [];
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "van-gogh-workbench",
      title: "Van Gogh Workbench",
      template: "modules/van-gogh/templates/workbench.hbs",
      width: 400,
      height: 600,
      resizable: true,
      dragDrop: [{ dragSelector: null, dropSelector: ".drop-zone" }]
    });
  }

  getData() {
    return {
      items: this.items,
      hasItems: this.items.length > 0
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".item-delete").click(this._onRemoveItem.bind(this));
    html.find("button[name='generate']").click(this._onGenerateAll.bind(this));
    html.find("button[name='clear']").click(this._onClearAll.bind(this));
  }

  async _onDrop(event) {
    event.preventDefault();
    const data = TextEditor.getDragEventData(event);
    
    if (data.type !== "Item") return;

    const item = await Item.implementation.fromDropData(data);
    if (!item) return;

    // Check if already in list
    if (this.items.find(i => i.id === item.id)) return;

    this.items.push({
      id: item.id,
      name: item.name,
      img: item.img,
      document: item,
      status: "pending",
      loading: false,
      success: false,
      error: null
    });

    this.render(true);
  }

  _onRemoveItem(event) {
    const li = $(event.currentTarget).closest(".item");
    const id = li.data("id");
    this.items = this.items.filter(i => i.id !== id);
    this.render(true);
  }

  _onClearAll() {
    this.items = [];
    this.render(true);
  }

  async _onGenerateAll() {
    const pendingItems = this.items.filter(i => !i.success && !i.loading);
    if (pendingItems.length === 0) return;

    for (const itemData of pendingItems) {
      // Update UI to show loading
      itemData.loading = true;
      this.render(true);

      try {
        await VanGoghApi.generateIcon(itemData.document, { silent: true });
        itemData.success = true;
        itemData.img = itemData.document.img; // Update image preview
      } catch (error) {
        console.error(error);
        itemData.error = error.message;
      } finally {
        itemData.loading = false;
      }
      
      // Re-render after each item to show progress
      this.render(true);
    }
  }
}
