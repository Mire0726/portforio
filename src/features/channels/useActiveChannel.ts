import { useCallback, useEffect, useState } from "react";
import { DEFAULT_CHANNEL, isChannelId, type ChannelId } from "./registry";

/** The channel in the hash, or null on the bare URL (the channel list on mobile). */
function routeFromHash(): ChannelId | null {
  const id = location.hash.replace(/^#\/?/, "");
  return isChannelId(id) ? id : null;
}

/** Matches Tailwind's `md` breakpoint, where the sidebar and a channel are shown side by side. */
const isDesktop = () => matchMedia("(min-width: 48rem)").matches;

/**
 * Hash-based routing (#/career) so channels are linkable without server rewrites.
 * Also tracks which channels have been opened, to render the rest as "unread".
 *
 * `route` is null on the bare URL: desktop shows DEFAULT_CHANNEL there, while mobile
 * shows the channel list as its home screen, like the Slack app.
 */
export function useActiveChannel() {
  const [route, setRoute] = useState<ChannelId | null>(routeFromHash);
  const [visited, setVisited] = useState<ReadonlySet<ChannelId>>(() => {
    const id = routeFromHash();
    if (id) return new Set([id]);
    // Only desktop opens DEFAULT_CHANNEL on the bare URL; mobile shows the list with nothing opened yet.
    return new Set(isDesktop() ? [DEFAULT_CHANNEL] : []);
  });

  const sync = useCallback(() => {
    const id = routeFromHash();
    setRoute(id);
    if (id) setVisited((v) => new Set(v).add(id));
  }, []);

  useEffect(() => {
    // pushState/back don't fire hashchange, and a hand-edited hash doesn't fire popstate.
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, [sync]);

  const navigate = useCallback(
    (id: ChannelId) => {
      history.pushState({ fromHome: routeFromHash() === null }, "", `#/${id}`);
      sync();
    },
    [sync],
  );

  /** Back to the channel list: pop the entry if we came from it, so the OS back gesture doesn't bounce back here. */
  const goHome = useCallback(() => {
    if (history.state?.fromHome) {
      history.back();
    } else {
      history.replaceState(null, "", location.pathname + location.search);
      sync();
    }
  }, [sync]);

  return { route, active: route ?? DEFAULT_CHANNEL, visited, navigate, goHome };
}
