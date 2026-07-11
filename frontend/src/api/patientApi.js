import api from "../services/axios";

export async function getPatients(){

    const {data}=await api.get(

        "/patients"

    );

    return data;

}

export async function updatePatient(

    id,

    payload,

){

    const {data}=await api.put(

        `/patients/${id}`,

        payload,

    );

    return data;

}