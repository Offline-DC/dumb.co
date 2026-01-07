import type { PressItemData } from "./PressItem";

import image from "../assets/article_one.webp";
import image2 from "../assets/imrs.webp";
import PressList from "./PressList";

const PRESS_ITEMS: PressItemData[] = [
  {
    id: "cringe",
    title: "is it cringe to be online?",
    image,
    href: "#",
    variant: "dark",
  },
  {
    id: "wp",
    title: "can u be dumb 4 1 month?",
    source: "Wash Post",
    image: image2,
    href: "#",
    variant: "light",
  },
  {
    id: "next",
    title: "lorem ipsum dolor",
    image,
    href: "#",
    variant: "light",
  },
];

export default function Press() {
  return <PressList title="Press" items={PRESS_ITEMS} />;
}
