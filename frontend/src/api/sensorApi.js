import api from "../services/axios";

export async function getSensors(){

    const {data}=await api.get(

        "/sensors"

    );

    return data;

}

export async function updateSensor(

    id,

    payload,

){

    const {data}=await api.put(

        `/sensors/${id}`,

        payload,

    );

    return data;

}