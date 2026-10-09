import { Link } from "react-router-dom";
import { SETTINGS } from "./content";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "2rem",
        color: "white",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>{SETTINGS.notFound.heading}</h1>
      <p style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>
        {SETTINGS.notFound.message}
      </p>

      <Link
        to="/"
        style={{
          padding: "0.75rem 1.25rem",
          border: "2px solid white",
          textDecoration: "none",
          fontWeight: "bold",
          color: "white",
        }}
      >
        {SETTINGS.notFound.button}
      </Link>
    </div>
  );
}
