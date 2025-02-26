import axios from "axios";


const axiosPublic = axios.create({
    baseURL:'https://todo-server-livid-two.vercel.app'
})

const useAxiosPublic = ()=>{
    return axiosPublic;
}

export default useAxiosPublic;