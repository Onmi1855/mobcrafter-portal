(() => {
  const SPRITE_PATH = "/assets/ui-icons.v1.svg";

  function escapeHtml(value){
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function icon(name, className = "ui-ico"){
    const iconName = escapeHtml(String(name || "file"));
    const cls = escapeHtml(String(className || "ui-ico"));
    return `<span class="${cls}" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><use href="${SPRITE_PATH}#${iconName}"></use></svg></span>`;
  }

  function label(name, text, options = {}){
    const wrapperClass = String(options.wrapperClass || "ui-label").trim();
    const iconClass = String(options.iconClass || "ui-ico").trim();
    const textClass = String(options.textClass || "").trim();
    const safeText = escapeHtml(text);
    const textMarkup = textClass
      ? `<span class="${escapeHtml(textClass)}">${safeText}</span>`
      : `<span>${safeText}</span>`;
    const body = `${icon(name, iconClass)}${textMarkup}`;
    if(!wrapperClass) return body;
    return `<span class="${escapeHtml(wrapperClass)}">${body}</span>`;
  }

  function set(element, name, text, options = {}){
    if(!element) return;
    element.innerHTML = label(name, text, options);
  }

  window.MobUi = {
    path: SPRITE_PATH,
    escapeHtml,
    icon,
    label,
    set,
  };
})();
