import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import ThemeProvider from "./themes/ThemeContext";

import DashboardProvider from "./context/DashboardProvider";

import "./styles/variables.css";
import "./styles/globals.css";
import "./styles/layout.css";

ReactDOM.createRoot(

    document.getElementById("root")

).render(

    <React.StrictMode>

        <BrowserRouter>

            <ThemeProvider>

                <DashboardProvider>

                    <App />

                </DashboardProvider>

            </ThemeProvider>

        </BrowserRouter>

    </React.StrictMode>

);