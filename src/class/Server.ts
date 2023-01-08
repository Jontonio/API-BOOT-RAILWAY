import { config } from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
config()

import express, { Application } from "express";
import { Buttons, Client, LocalAuth, Location, MessageMedia, List, Chat } from "whatsapp-web.js";
import socketIO from 'socket.io'
import http from 'http'
import cors from "cors";
import cron from "node-cron";
import { Response, Request } from "express";
import moment from "moment";
import { onMessagePeople } from '../helpers/messagePeople';
import { sendPaymentGirlFriend } from '../helpers/messageGirlFiend';

moment.locale('es');

const corsOptions = {
    //? Need change url production */
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}


export class Server {

    app       : Application;
    port      : number | string;
    httpServer: http.Server;
    io        : socketIO.Server;
    client    : Client;

    constructor(){
        
        this.app  = express();
        this.port = 8000;

        /** Socket io */
        this.httpServer = new http.Server(this.app);
        this.io = new socketIO.Server(this.httpServer, {
            cors: corsOptions
        });

        /** Client of whatsapp */
        this.client = new Client({ puppeteer: { headless: true,args: ['--no-sandbox', '--disable-setuid-sandbox']},
            authStrategy: new LocalAuth({dataPath:'auth-whatsapp'}),
        });

        this.middlewars();
        this.socket();
        this.boot();
        this.routes();

    }

    private boot(){

        this.client.on('authenticated', () => {
            console.log("Session iniciada");
            this.io.emit('boot',{ msg:"Usuario autenticado", qr:'', authenticated:true })
        })
        
        this.client.on('qr', (qr:any) => {
            console.log("escane el qr");
            this.io.emit('boot',{ msg:"Escane el código QR de whatsApp", qr , authenticated:false })
        });
        
        this.client.on('ready', () => {
            this.io.emit('boot',{ msg:"Código escaneado correctamete", qr:'' , authenticated:true })
            this.sendAutoMessage();
            console.log('Client is ready!');
        });
        
        this.client.on("disconnected",(reson)=> {
            console.log("se cerró sesión: ", reson);
            this.client.destroy();
            this.client.initialize();
        })

        this.client.on('message', async (message) => {

            const chat:Chat = await message.getChat()

            if(!chat.isGroup){
                onMessagePeople(this.client, message);
            }
            
        })

        this.client.initialize();
    }
        
    sendAutoMessage(){
        
        cron.schedule('30 7 * * *', () => {
            sendPaymentGirlFriend(this.client);
        });

    }
    
    private socket(){
        
        this.io.on('connection', clientSocket => {

            this.io.emit('welcome',{msg:"Saludos del SERVER"})
        })
        
    }

    middlewars(){
        this.app.use( express.json() );
        this.app.use( cors(corsOptions) );
    }

    routes(){

        this.app.get("/boot", (req:Request, res:Response) => {
            res.json({"msg":"This is web app"});
        })
        // this.app.use('/user', userRoute )
    }

    listen(){
        this.httpServer.listen(this.port, ()=> {
            console.log(`Server online on Port ${this.port}`);
        })
    }
}