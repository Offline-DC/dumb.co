/**
 * react-player, loaded in the browser only. It can't render on the server,
 * and it was the one thing keeping /setup and /support from being built
 * into real HTML; with it behind this, the pages' words are in the markup
 * (search engines read them without JavaScript) and the videos appear once
 * the page wakes up.
 */
import { useEffect, useState, type ComponentType } from "react";

type Props = Record<string, unknown>;

export default function LazyPlayer(props: Props) {
  const [Player, setPlayer] = useState<ComponentType<Props> | null>(null);
  useEffect(() => {
    let live = true;
    import("react-player").then((m) => {
      // CommonJS under Astro's build: the default can arrive wrapped once more
      const mod = m as unknown as { default: { default?: ComponentType<Props> } & ComponentType<Props> };
      const P = (mod.default.default ?? mod.default) as ComponentType<Props>;
      if (live) setPlayer(() => P);
    });
    return () => { live = false; };
  }, []);
  return Player ? <Player {...props} /> : null;
}
