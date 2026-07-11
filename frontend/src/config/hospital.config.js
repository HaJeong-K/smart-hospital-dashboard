const hospitalConfig = {
    hospital: {
        id: "hospital-001",
        name: "스마트요양병원",
        building: "본관",
    },

    floors: [
        {
            id: "1F",
            name: "1F",

            floorMap: {
                type: "image",
                src: "/maps/1f.png",
                width: 1920,
                height: 1080,
            },

            rooms: [],
        },

        {
            id: "2F",
            name: "2F",

            floorMap: {
                type: "image",
                src: "/maps/2f.png",
                width: 1920,
                height: 1080,
            },

            rooms: [],
        },

        {
            id: "3F",
            name: "3F",

            floorMap: {
                type: "image",
                src: "/maps/3f.png",
                width: 1920,
                height: 1080,
            },

            rooms: [
                {
                    id: "301",
                    roomNo: "301",

                    polygon: [
                        [0.05, 0.06],
                        [0.18, 0.06],
                        [0.18, 0.18],
                        [0.05, 0.18],
                    ],

                    patient: {
                        name: "김○○",
                        age: 82,
                    },

                    sensors: [
                        {
                            id: "R301",
                            type: "MMWAVE",
                        },
                    ],

                    status: {
                        room: "normal",
                    },
                },

                {
                    id: "302",
                    roomNo: "302",

                    polygon: [
                        [0.20, 0.06],
                        [0.33, 0.06],
                        [0.33, 0.18],
                        [0.20, 0.18],
                    ],

                    patient: {
                        name: "이○○",
                        age: 79,
                    },

                    sensors: [
                        {
                            id: "R302",
                            type: "MMWAVE",
                        },
                    ],

                    status: {
                        room: "warning",
                    },
                },

                {
                    id: "303",
                    roomNo: "303",

                    polygon: [
                        [0.35, 0.06],
                        [0.48, 0.06],
                        [0.48, 0.18],
                        [0.35, 0.18],
                    ],

                    patient: {
                        name: "박○○",
                        age: 84,
                    },

                    sensors: [
                        {
                            id: "R303",
                            type: "MMWAVE",
                        },
                    ],

                    status: {
                        room: "danger",
                    },
                },
            ],
        },
    ],
};

export default hospitalConfig;