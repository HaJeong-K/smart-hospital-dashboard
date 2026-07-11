import { useContext } from "react";
import DashboardContext from "../context/DashboardContext";

export default function useDashboard() {
    return useContext(DashboardContext);
}