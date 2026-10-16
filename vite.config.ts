import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { CONTENT_DIR, loadPosts, loadProfile } from "./scripts/load-content.ts";

const CONTENT_ID = "virtual:content";
const RESOLVED_CONTENT_ID = "\0" + CONTENT_ID;

/** Exposes content/ (profile + posts) as `virtual:content`, parsed at build time; reloads the page on edits. */
function content(): Plugin {
  return {
    name: "content",
    resolveId: (id) => (id === CONTENT_ID ? RESOLVED_CONTENT_ID : undefined),
    async load(id) {
      if (id !== RESOLVED_CONTENT_ID) return;
      const [profile, { career, activities }] = await Promise.all([loadProfile(), loadPosts()]);
      return [
        `export const profile = ${JSON.stringify(profile)};`,
        `export const careerPosts = ${JSON.stringify(career)};`,
        `export const activityPosts = ${JSON.stringify(activities)};`,
      ].join("\n");
    },
    configureServer(server) {
      server.watcher.add(CONTENT_DIR);
      const reload = (file: string) => {
        if (!file.startsWith(CONTENT_DIR)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_CONTENT_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", reload).on("change", reload).on("unlink", reload);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), content()],
});
