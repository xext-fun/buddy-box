const api = globalThis.browser || globalThis.chrome;
if (api.sidePanel?.setPanelBehavior) {
  api.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
}
if (api.sidebarAction?.open) {
  api.action.onClicked.addListener(() => api.sidebarAction.open());
}
