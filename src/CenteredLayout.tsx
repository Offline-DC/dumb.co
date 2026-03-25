import { Outlet } from "react-router-dom";

export default function CenteredShell() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        backgroundColor: "#F9F594",
        display: "flex",
        margin: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "auto 0rem",
          backgroundColor: "#F9F594",
          maxWidth: "100%",
          width: "100%",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
