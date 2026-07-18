import {
    createContext,
    useEffect,
    useMemo,
    useState,
} from "react";

export const ThemeContext = createContext();

// 저장된 선호값이 없을 때의 기본 테마 — 항상 라이트 모드로 시작한다.
// (이전에는 브라우저 언어로 아시아권/외국권을 추정해 다크 모드를 기본값으로 고르기도 했으나,
//  2026-07-17 피드백에 따라 기본 테마는 항상 라이트로 고정한다. 사용자가 설정에서
//  직접 다크 모드로 전환하면 그 선택은 localStorage에 저장되어 계속 유지된다.)
const DEFAULT_THEME = "light";

function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || DEFAULT_THEME
    );

    useEffect(() => {
        document.documentElement.setAttribute(
            "data-theme",
            theme
        );

        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) =>
            prev === "dark" ? "light" : "dark"
        );
    };

    const value = useMemo(
        () => ({
            theme,
            toggleTheme,
        }),
        [theme]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export default ThemeProvider;