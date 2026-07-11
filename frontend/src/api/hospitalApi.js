import api from "../services/axios";

export async function getHospital() {

    const { data } = await api.get("/hospital");

    return data;

}

export async function saveHospital(payload) {

    const { data } = await api.post(

        "/hospital",

        payload

    );

    return data;

}

export async function updateHospital(id, payload) {

    const { data } = await api.put(

        `/hospital/${id}`,

        payload

    );

    return data;

}