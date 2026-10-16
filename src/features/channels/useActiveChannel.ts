import { useCallback, useEffect, useState } from "react";
import { DEFAULT_CHANNEL, isChannelId, type ChannelId } from "./registry";

function channelFromHash(): ChannelId {
  const id = location.hash.replace(/^#\/?/, "");
  return isChannelId(id) ? id : DEFAULT_CHANNEL;
}

/**
 * Hash-based routing (#/career) so channels are linkable without server rewrites.
 * Also tracks which channels have been opened, to render the rest as "unread".
 */
export function useActiveChannel() {
  const [active, setActive] = useState<ChannelId>(channelFromHash);
  const [visited, setVisited] = useState<ReadonlySet<ChannelId>>(() => new Set([channelFromHash()]));

  useEffect(() => {
    const onHashChange = () => {
      const id = channelFromHash();
      setActive(id);
      setVisited((v) => new Set(v).add(id));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((id: ChannelId) => {
    location.hash = `/${id}`;
  }, []);

  return { active, visited, navigate };
}
