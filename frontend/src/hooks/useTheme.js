import { useContext } from "react";
import { ThemeContext } from "../themes/ThemeContext";

export default function useTheme() {
    return useContext(ThemeContext);
}