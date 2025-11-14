type Props = {
  onClick?: () => void;
  children: any;
};

function NavButton({ children, onClick }: Props) {
  return (
    <div style={{ aspectRatio: "2", display: "flex", alignItems: "center" }}>
      <button
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "95%",
          width: "95%",
          borderRadius: "0.5rem",
          border: "1px solid #bbb",
          background: "linear-gradient(to bottom, #eaeaea, #d4d4d4)",
          boxShadow: `
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    inset 0 -1px 2px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.2)
  `,
          fontWeight: "bold",
          fontSize: "1.5rem",
          color: "#333",
          cursor: "pointer",
          transition: "transform 0.1s ease, box-shadow 0.1s ease",
        }}
        onClick={onClick}
        onMouseDown={(e) =>
          (e.currentTarget.style.transform = "translateY(2px)")
        }
        onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        {children}
      </button>
    </div>
  );
}

export default NavButton;
