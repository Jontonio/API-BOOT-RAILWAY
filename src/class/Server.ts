import { config } from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
config()

import express, { Application } from "express";
import { Buttons, Client, LocalAuth, Location, MessageMedia, List } from "whatsapp-web.js";
import socketIO from 'socket.io'
import http from 'http'
import cors from "cors";
import cron from "node-cron";
import { Response, Request } from "express";
import moment from "moment";

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

        this.client.on('message',(message) => {

            if(message.body.toLowerCase()=='dime la fecha'){
                
                const hoy = moment().format('dddd Do MMMM YYYY');
                this.client.sendMessage(message.from,`Hola 🐰 la fecha es: ${hoy}`).then( res => {
                    console.log("Mensaje de fecha enviada");
                }).catch( error => {
                    console.log('Hubo un error al enviar la fecha');
                    
                })
            }
            
        })

        this.client.initialize();
            
    }
        
    sendAutoMessage(){
        
        //?Need config hour for send
        cron.schedule('30 7 * * *', () => {
            
            const hoy = moment().format('dddd Do MMMM YYYY');
            const dia = moment().format("D");
            //! I need ichat of the group
            const idChat:string = '120363026636473509@g.us'; 

            if( parseInt(dia) % 2 != 0 ){

                const win = Math.floor(Math.random() * (20 - 5) + 5);
                const message = `Holaa 👋 buenos días ✨, hoy ${hoy} \n *Daira 🐼* y *José Antonio 🐰* \n tienen que pagar *s/. ${win}* \n`;
                console.log(message, dia);
                this.client.sendMessage(idChat, message).then( res => {
                    console.log(res);
                });

            } else {

                this.client.sendMessage(idChat,`Hoy ${hoy} 😞 no toca pagar para nuestro viaje, pero mañana si 🥺`)
                    .then( res => {
                        console.log(res);
                    })
            }
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