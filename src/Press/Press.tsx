import PressList from "./PressList";
import { useEffect, type Dispatch, type SetStateAction } from "react";
import { PRESS_ITEMS } from "./parsePressData";
import { PRESS } from "../content/press";

export { PRESS_ITEMS };

type Props = {
  row: number;
  setOptions: Dispatch<SetStateAction<string[]>>;
};

export default function Press({ row, setOptions }: Props) {
  useEffect(() => {
    setOptions(PRESS_ITEMS.map((item) => item.id));
  }, [setOptions]);

  return (
    <PressList
      title={PRESS.heading}
      subtitle={PRESS.contactEmail}
      items={PRESS_ITEMS}
      row={row}
    />
  );
}
