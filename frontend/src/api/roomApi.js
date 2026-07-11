import api from "../services/axios";

export async function getRooms(floorId){

    const {data}=await api.get(

        `/rooms/${floorId}`

    );

    return data;

}

export async function saveRoom(payload){

    const {data}=await api.post(

        "/rooms",

        payload

    );

    return data;

}

export async function updateRoom(id,payload){

    const {data}=await api.put(

        `/rooms/${id}`,

        payload

    );

    return data;

}

export async function deleteRoom(id){

    await api.delete(

        `/rooms/${id}`

    );

}