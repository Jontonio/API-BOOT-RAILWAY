import WAWebJS, { Chat, Client } from "whatsapp-web.js";
import moment from "moment";
import axios from 'axios';

interface Persona{
    nombre:string, // only first name
    nombres:string // full name
}

export const onMessagePeople = async (client:Client, message:WAWebJS.Message) => {
    
    const { body } = message;

    if(body.toLowerCase()=='dime la fecha'){
        sendFecha(client, message);
    }

    if(body.toLowerCase()=='mi dni'){
        sendDNIInfo(client, message);
    }

    if(!isNaN(parseInt(body)) && body.length==8){
        const dni:string = body;
        try {
            const hoy = moment().format('dddd Do MMMM YYYY, h:mm:ss a');
            const data = await axios.get(`https://api.apis.net.pe/v1/dni?numero=${dni}`);
            await client.sendMessage(message.from,`Hola 👋 mucho gusto ${data.data.nombres},\n *Datos completos:* ${data.data.nombre} \n *Fecha de consulta:* ${hoy}`).then( res => {
                console.log("Mensaje de fecha enviada correctamente");
            }).catch( error => {
                console.log('Hubo un error al enviar la fecha');
            })
        } catch (error) {
            client.sendMessage(message.from,`No se encontro los datos para el ${dni} 😥`).then( res => {
                console.log("Mensaje de fecha enviada correctamente");
            }).catch( error => {
                console.log('Hubo en la consulta de DNI');
            })
        }
    }
}

const sendFecha = (client:Client, message:WAWebJS.Message) => {

    const hoy = moment().format('dddd Do MMMM YYYY');
    client.sendMessage(message.from,`*Hola 🐰 la fecha es:* ${hoy}`).then( res => {
        console.log("Mensaje de fecha enviada correctamente");
    }).catch( error => {
        console.log('Hubo un error al enviar la fecha');
    })

}

const sendDNIInfo = async (client:Client, message:WAWebJS.Message) => {
    await message.reply("🚀 Muy bien digite su número de DNI: ");
}