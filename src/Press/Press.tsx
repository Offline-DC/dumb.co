import type { PressItemData } from "./PressItem";

import image from "./images/article_one.webp";
import image2 from "./images/imrs.webp";
import PressList from "./PressList";
import type { Dispatch, SetStateAction } from "react";

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

type Props = {
  row: number;
  setRow: Dispatch<SetStateAction<number>>;
};

export default function Press({ row, setRow }: Props) {
  return (
    <PressList title="Press" items={PRESS_ITEMS} row={row} setRow={setRow} />
  );
}
