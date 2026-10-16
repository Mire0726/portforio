import type { ComponentType } from "react";
import type { ChannelId } from "./registry";
import { AboutChannel } from "./views/AboutChannel";
import { ContactChannel } from "./views/ContactChannel";
import { ActivitiesChannel } from "./views/ActivitiesChannel";
import { CareerChannel } from "./views/CareerChannel";
import { ZennChannel } from "./views/ZennChannel";

// Record<ChannelId, …> makes adding a channel without a view a type error.
const views: Record<ChannelId, ComponentType> = {
  about: AboutChannel,
  career: CareerChannel,
  activities: ActivitiesChannel,
  zenn: ZennChannel,
  contact: ContactChannel,
};

export function ChannelView({ id }: { id: ChannelId }) {
  const View = views[id];
  return <View />;
}
