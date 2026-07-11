import api from "../services/axios";

export async function getDashboard(){

    const {data}=await api.get(

        "/dashboard"

    );

    return data;

}