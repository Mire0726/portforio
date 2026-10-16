import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { CONTENT_DIR, loadPosts } from "./scripts/load-posts.ts";

const POSTS_ID = "virtual:posts";
const RESOLVED_POSTS_ID = "\0" + POSTS_ID;

/** Exposes content/**\/*.md as `virtual:posts`, parsed at build time; reloads the page when a post changes. */
function posts(): Plugin {
  return {
    name: "posts",
    resolveId: (id) => (id === POSTS_ID ? RESOLVED_POSTS_ID : undefined),
    async load(id) {
      if (id !== RESOLVED_POSTS_ID) return;
      const { career, activities } = await loadPosts();
      return `export const careerPosts = ${JSON.stringify(career)};\nexport const activityPosts = ${JSON.stringify(activities)};`;
    },
    configureServer(server) {
      server.watcher.add(CONTENT_DIR);
      const reload = (file: string) => {
        if (!file.startsWith(CONTENT_DIR)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_POSTS_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", reload).on("change", reload).on("unlink", reload);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), posts()],
});
