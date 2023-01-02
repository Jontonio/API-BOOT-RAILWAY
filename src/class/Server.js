"use strict";
exports.__esModule = true;
exports.Server = void 0;
var dotenv_1 = require("dotenv"); // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
(0, dotenv_1.config)();
var express_1 = require("express");
var whatsapp_web_js_1 = require("whatsapp-web.js");
var socket_io_1 = require("socket.io");
var http_1 = require("http");
var cors_1 = require("cors");
var node_cron_1 = require("node-cron");
var moment_1 = require("moment");
moment_1["default"].locale('es');
var corsOptions = {
    //? Need change url production */
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
var Server = /** @class */ (function () {
    function Server() {
        this.app = (0, express_1["default"])();
        this.port = 8000;
        /** Socket io */
        this.httpServer = new http_1["default"].Server(this.app);
        this.io = new socket_io_1["default"].Server(this.httpServer, {
            cors: corsOptions
        });
        /** Client of whatsapp */
        this.client = new whatsapp_web_js_1.Client({ puppeteer: { headless: true },
            authStrategy: new whatsapp_web_js_1.LocalAuth({ dataPath: 'auth-whatsapp' })
        });
        this.middlewars();
        this.socket();
        this.boot();
        this.routes();
    }
    Server.prototype.boot = function () {
        var _this = this;
        this.client.on('authenticated', function () {
            console.log("Session iniciada");
            _this.io.emit('boot', { msg: "Usuario autenticado", qr: '', authenticated: true });
        });
        this.client.on('qr', function (qr) {
            console.log("escane el qr");
            _this.io.emit('boot', { msg: "Escane el código QR de whatsApp", qr: qr, authenticated: false });
        });
        this.client.on('ready', function () {
            _this.io.emit('boot', { msg: "Código escaneado correctamete", qr: '', authenticated: true });
            _this.sendAutoMessage();
            console.log('Client is ready!');
        });
        this.client.on("disconnected", function (reson) {
            console.log("se cerró sesión: ", reson);
            _this.client.destroy();
            _this.client.initialize();
        });
        this.client.initialize();
    };
    Server.prototype.sendAutoMessage = function () {
        var _this = this;
        //?Need config hour for send
        node_cron_1["default"].schedule('0 7 * * *', function () {
            var hoy = (0, moment_1["default"])().format('dddd Do MMMM YYYY');
            var dia = (0, moment_1["default"])().format("D");
            //! I need ichat of the group
            var idChat = '120363026636473509@g.us';
            if (parseInt(dia) % 2 != 0) {
                var win = Math.floor(Math.random() * (20 - 5) + 5);
                var message = "Holaa \uD83D\uDC4B buenos d\u00EDas \u2728, hoy ".concat(hoy, " \n *Daira \uD83D\uDC3C* y *Jos\u00E9 Antonio \uD83D\uDC30* \n tienen que pagar *s/. ").concat(win, "* \n");
                console.log(message, dia);
                _this.client.sendMessage(idChat, message).then(function (res) {
                    console.log(res);
                });
            }
            else {
                _this.client.sendMessage(idChat, "Hoy ".concat(hoy, " \uD83D\uDE1E no toca pagar para nuestro viaje, pero ma\u00F1ana si \uD83E\uDD7A"))
                    .then(function (res) {
                    console.log(res);
                });
            }
        });
    };
    Server.prototype.socket = function () {
        var _this = this;
        this.io.on('connection', function (clientSocket) {
            _this.io.emit('welcome', { msg: "Saludos del SERVER" });
        });
    };
    Server.prototype.middlewars = function () {
        this.app.use(express_1["default"].json());
        this.app.use((0, cors_1["default"])(corsOptions));
    };
    Server.prototype.routes = function () {
        this.app.get("/", function (req, res) {
            res.json({ "msg": "This is web app" });
        });
        // this.app.use('/user', userRoute )
    };
    Server.prototype.listen = function () {
        var _this = this;
        this.httpServer.listen(this.port, function () {
            console.log("Server online on Port ".concat(_this.port));
        });
    };
    return Server;
}());
exports.Server = Server;
