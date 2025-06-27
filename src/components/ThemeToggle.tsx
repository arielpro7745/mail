import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const cl = document.documentElement.classList;
    dark ? cl.add("dark") : cl.remove("dark");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      className="text-2xl hover:scale-110 transition"
      title={dark ? "מצב‑בהיר" : "מצב‑כהה"}
      onClick={() => setDark((d) => !d)}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
