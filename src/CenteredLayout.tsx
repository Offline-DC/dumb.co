import { Outlet } from "react-router-dom";

export default function CenteredShell() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        backgroundColor: "rgb(51, 51, 51)",
        display: "flex",
        margin: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "auto .5rem",
          maxWidth: "100%",
          width: "100%",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
