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
exports.Server = void 0;
const dotenv_1 = require("dotenv"); // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
(0, dotenv_1.config)();
const express_1 = __importDefault(require("express"));
const whatsapp_web_js_1 = require("whatsapp-web.js");
const socket_io_1 = __importDefault(require("socket.io"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const node_cron_1 = __importDefault(require("node-cron"));
const moment_1 = __importDefault(require("moment"));
const messagePeople_1 = require("../helpers/messagePeople");
const messageGirlFiend_1 = require("../helpers/messageGirlFiend");
moment_1.default.locale('es');
const corsOptions = {
    //? Need change url production */
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = 8000;
        /** Socket io */
        this.httpServer = new http_1.default.Server(this.app);
        this.io = new socket_io_1.default.Server(this.httpServer, {
            cors: corsOptions
        });
        /** Client of whatsapp */
        this.client = new whatsapp_web_js_1.Client({ puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
            authStrategy: new whatsapp_web_js_1.LocalAuth({ dataPath: 'auth-whatsapp' }),
        });
        this.middlewars();
        this.socket();
        this.boot();
        this.routes();
    }
    boot() {
        this.client.on('authenticated', () => {
            console.log("Session iniciada");
            this.io.emit('boot', { msg: "Usuario autenticado", qr: '', authenticated: true });
        });
        this.client.on('qr', (qr) => {
            console.log("escane el qr");
            this.io.emit('boot', { msg: "Escane el c??digo QR de whatsApp", qr, authenticated: false });
        });
        this.client.on('ready', () => {
            this.io.emit('boot', { msg: "C??digo escaneado correctamete", qr: '', authenticated: true });
            this.sendAutoMessage();
            console.log('Client is ready!');
        });
        this.client.on("disconnected", (reson) => {
            console.log("se cerr?? sesi??n: ", reson);
            this.client.destroy();
            this.client.initialize();
        });
        this.client.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
            const chat = yield message.getChat();
            if (!chat.isGroup) {
                (0, messagePeople_1.onMessagePeople)(this.client, message);
            }
        }));
        this.client.initialize();
    }
    sendAutoMessage() {
        node_cron_1.default.schedule('30 7 * * *', () => {
            (0, messageGirlFiend_1.sendPaymentGirlFriend)(this.client);
        });
    }
    socket() {
        this.io.on('connection', clientSocket => {
            this.io.emit('welcome', { msg: "Saludos del SERVER" });
        });
    }
    middlewars() {
        this.app.use(express_1.default.json());
        this.app.use((0, cors_1.default)(corsOptions));
    }
    routes() {
        this.app.get("/boot", (req, res) => {
            res.json({ "msg": "This is web app" });
        });
        // this.app.use('/user', userRoute )
    }
    listen() {
        this.httpServer.listen(this.port, () => {
            console.log(`Server online on Port ${this.port}`);
        });
    }
}
exports.Server = Server;
//# sourceMappingURL=Server.js.map