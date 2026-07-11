import api from "../services/axios";

export async function getFloors() {

    const { data } = await api.get("/floors");

    return data;

}

export async function saveFloor(payload) {

    const { data } = await api.post(

        "/floors",

        payload

    );

    return data;

}

export async function deleteFloor(id) {

    await api.delete(

        `/floors/${id}`

    );

}