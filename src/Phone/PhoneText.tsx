type Props = {
  highlight: boolean;
  children: any;
};

function PhoneText({ highlight, children }: Props) {
  return (
    <div
      style={{
        backgroundColor: !highlight ? "transparent" : "black",
        color: !highlight ? "black" : "white",
        padding: ".5rem .5rem",
        display: "flex",
        alignItems: "center",
        fontSize: "1.25rem",
      }}
    >
      {highlight ? "> " : ""}
      {children}
    </div>
  );
}

export default PhoneText;
