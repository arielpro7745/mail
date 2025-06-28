import ThemeToggle from "./ThemeToggle";
import Settings from "./Settings";

export default function Header() {
  return (
    <header className="bg-indigo-600 text-white flex items-center justify-between p-4 shadow">
      <h1 className="text-lg font-bold">מעקב חלוקת דואר – דואר ישראל</h1>
      <div className="flex items-center gap-2">
        <Settings />
        <ThemeToggle />
      </div>
    </header>
  );
}