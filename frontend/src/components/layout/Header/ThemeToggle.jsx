import { Moon, Sun } from "lucide-react";
import useTheme from "../../../hooks/useTheme";

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className="icon-button"
            onClick={toggleTheme}
        >
            {theme === "dark" ? (
                <Sun size={20} />
            ) : (
                <Moon size={20} />
            )}
        </button>
    );
}

export default ThemeToggle;