import type { PressItemData } from "./PressItem";

import PressList from "./PressList";
import { useEffect, type Dispatch, type SetStateAction } from "react";
import rawPressData from "./press_data.md?raw";
import { parsePressMarkdown } from "./parsePressData";

export const PRESS_ITEMS: PressItemData[] = parsePressMarkdown(rawPressData);

type Props = {
  row: number;
  setOptions: Dispatch<SetStateAction<string[]>>;
};

export default function Press({ row, setOptions }: Props) {
  useEffect(() => {
    setOptions(PRESS_ITEMS.map((item) => item.id));
  }, [setOptions]);

  return <PressList title="Press" items={PRESS_ITEMS} row={row} />;
}
