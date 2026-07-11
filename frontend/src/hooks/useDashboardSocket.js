import { useEffect } from "react";

import socket from "../services/websocket";

function useDashboardSocket(callback) {

    useEffect(() => {

        socket.connect();

        socket.subscribe(callback);

        return () => {

            socket.unsubscribe(callback);

        };

    }, [callback]);

}

export default useDashboardSocket;