export default defineNuxtRouteMiddleware((_to, _from) => {
  if (!process.client) return;
  const nuxtApp = useNuxtApp();
  const api = nuxtApp.$smoother as any;
  try {
    api && api.kill && api.kill();
  } catch (e) {}
});
