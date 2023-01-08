"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMessagePeople = void 0;
const moment_1 = __importDefault(require("moment"));
const axios_1 = __importDefault(require("axios"));
const onMessagePeople = (client, message) => __awaiter(void 0, void 0, void 0, function* () {
    const { body } = message;
    if (body.toLowerCase() == 'dime la fecha') {
        sendFecha(client, message);
    }
    if (body.toLowerCase() == 'mi dni') {
        sendDNIInfo(client, message);
    }
    if (!isNaN(parseInt(body)) && body.length == 8) {
        const dni = body;
        try {
            const hoy = (0, moment_1.default)().format('dddd Do MMMM YYYY, h:mm:ss a');
            const data = yield axios_1.default.get(`https://api.apis.net.pe/v1/dni?numero=${dni}`);
            yield client.sendMessage(message.from, `Hola 👋 mucho gusto ${data.data.nombres},\n *Datos completos:* ${data.data.nombre} \n *Fecha de consulta:* ${hoy}`).then(res => {
                console.log("Mensaje de fecha enviada correctamente");
            }).catch(error => {
                console.log('Hubo un error al enviar la fecha');
            });
        }
        catch (error) {
            client.sendMessage(message.from, `No se encontro los datos para el ${dni} 😥`).then(res => {
                console.log("Mensaje de fecha enviada correctamente");
            }).catch(error => {
                console.log('Hubo en la consulta de DNI');
            });
        }
    }
});
exports.onMessagePeople = onMessagePeople;
const sendFecha = (client, message) => {
    const hoy = (0, moment_1.default)().format('dddd Do MMMM YYYY');
    client.sendMessage(message.from, `*Hola 🐰 la fecha es:* ${hoy}`).then(res => {
        console.log("Mensaje de fecha enviada correctamente");
    }).catch(error => {
        console.log('Hubo un error al enviar la fecha');
    });
};
const sendDNIInfo = (client, message) => __awaiter(void 0, void 0, void 0, function* () {
    yield message.reply("🚀 Muy bien digite su número de DNI: ");
});
//# sourceMappingURL=messagePeople.js.map