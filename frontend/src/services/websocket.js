class DashboardSocket {

    constructor() {

        this.socket = null;

        this.listeners = [];

    }

    connect() {

        if (this.socket) return;

        this.socket = new WebSocket(

            "ws://localhost:8000/ws"

        );

        this.socket.onopen = () => {

            console.log("WebSocket Connected");

        };

        this.socket.onmessage = (event) => {

            const data = JSON.parse(event.data);

            this.listeners.forEach(listener =>

                listener(data)

            );

        };

        this.socket.onclose = () => {

            console.log("WebSocket Closed");

            this.socket = null;

        };

    }

    disconnect() {

        if (!this.socket) return;

        this.socket.close();

    }

    subscribe(callback) {

        this.listeners.push(callback);

    }

    unsubscribe(callback) {

        this.listeners = this.listeners.filter(

            item => item !== callback

        );

    }

}

export default new DashboardSocket();