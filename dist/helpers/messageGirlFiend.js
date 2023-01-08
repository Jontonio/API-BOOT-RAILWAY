"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPaymentGirlFriend = void 0;
const moment_1 = __importDefault(require("moment"));
const sendPaymentGirlFriend = (client) => {
    const hoy = (0, moment_1.default)().format('dddd Do MMMM YYYY');
    const dia = (0, moment_1.default)().format("D");
    //! I need ichat of the group
    const idChat = '120363026636473509@g.us';
    if (parseInt(dia) % 2 != 0) {
        const win = Math.floor(Math.random() * (20 - 5) + 5);
        const message = `Holaa 👋 buenos días ✨, hoy ${hoy} \n *Daira 🐼* y *José Antonio 🐰* \n tienen que pagar *s/. ${win}* \n`;
        console.log(message, dia);
        client.sendMessage(idChat, message).then(res => {
            console.log('Mensaje enviado para pagar');
        }).catch(error => {
            console.log('Mensaje para pagar no enviado');
        });
    }
    else {
        client.sendMessage(idChat, `Hoy ${hoy} 😞 no toca pagar para nuestro viaje, pero mañana si 🥺`)
            .then(res => {
            console.log('Mensaje enviado para no realizar el pago');
        }).catch(error => {
            console.log('Mensaje no enviado para no realizar el pago');
        });
    }
};
exports.sendPaymentGirlFriend = sendPaymentGirlFriend;
//# sourceMappingURL=messageGirlFiend.js.map