const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8000 });
const clients = new Map();
var socket_to_instanceid = new Map();
var socket_list = [];
function delay(param1) {
    return new Promise(resolve => setTimeout(resolve, param1));
}
wss.on('connection', (ws) => {
    const id = uuidv4();
    const metadata = { id };
    var sent_id = id.toString();
    clients.set(ws, metadata);
    console.log("> "+sent_id+" connected!");
    ws.on('message', (BUF) => {
        var BF = BUF.toString('utf-8');
        if (BF.includes("YGYGTHISISACHATYGYG")){
            var data = BF.slice(BF.indexOf("{{")+2, BF.indexOf("}}"));
            [...clients.keys()].forEach((client) => {
                client.send("02"+data);
            });
        }else{
            var data = BF.slice(BF.indexOf("{{")+2, BF.indexOf("}}"));
            var index = data[0];
            var info = [];
            for(i=0; i < index; i+=1){
                info[i] = data.slice(data.indexOf("(")+1, data.indexOf(")"));
                data = data.slice(data.indexOf(")")+1,data.length);
            }
            info[0] = parseInt(info[0]);
            if(info[0] == 0){
                [...clients.keys()].forEach((client) => {
                    client.send("03 >>> "+info[1]+" has entered the lobby!");
                });
                info = info.slice(1);
                info[5]=0;
                info[6]=0;
                info[7]=0;
                info[8]=sent_id;
                info[9]="0";
                socket_to_instanceid.set(sent_id, info);
                socket_list.push(sent_id);
                info = info.toString();
                (async() => {
                    await ws.send("00"+sent_id);
                    await delay(100);
                    await [...clients.keys()].forEach((client) => {
                        client.send("01"+info);
                    });
                    for(i=0; i < socket_to_instanceid.size; i+=1){
                        if (socket_to_instanceid.get(sent_id)[8] !== socket_list[i]){
                            let be = socket_to_instanceid.get(socket_list[i]);
                            ws.send("01"+be);
                        }
                    }
                })()
            }
            if(info[0] == 1){
                [...clients.keys()].forEach((client) => {
                    client.send("05"+info[2]+sent_id+","+info[1]+",");
                });
            }
            if(info[0] == 2){
                [...clients.keys()].forEach((client) => {
                    client.send("06"+sent_id+","+info[1]+",");
                });
                [...clients.keys()].forEach((client) => {
                    client.send("0501"+sent_id+",ALL,");
                });
                [...clients.keys()].forEach((client) => {
                    client.send("0501"+info[1]+",ALL,");
                });
                var who = socket_to_instanceid.get(info[1]);
                var NEW = [who[0],who[1],who[2],who[3],who[4],who[5],who[6],"01",who[8], who[9]];
                socket_to_instanceid.set(info[1], NEW);
                who = socket_to_instanceid.get(sent_id);
                NEW = [who[0],who[1],who[2],who[3],who[4],who[5],who[6],"01",who[8], who[9]];
                socket_to_instanceid.set(sent_id, NEW);
                (async() => {
                    var serve_time = "180";
                    [...clients.keys()].forEach((client) => {
                        client.send("07"+serve_time+sent_id+","+info[1]+",");
                    });
                    await delay(1000);
                    serve_time = "120";
                    [...clients.keys()].forEach((client) => {
                        client.send("07"+serve_time+sent_id+","+info[1]+",");
                    });
                    await delay(1000);
                    serve_time = "060";
                    [...clients.keys()].forEach((client) => {
                        client.send("07"+serve_time+sent_id+","+info[1]+",");
                    });
                    await delay(1000);
                    serve_time = "000";
                    [...clients.keys()].forEach((client) => {
                        client.send("07"+serve_time+sent_id+","+info[1]+",");
                    });
                })()

            }
            if(info[0] == 3){
                [...clients.keys()].forEach((client) => {
                    client.send("08"+info[1]+","+info[2]+","+info[3]+",");
                });
            }
            if(info[0] == 4){
                [...clients.keys()].forEach((client) => {
                    client.send("09"+sent_id+","+info[1]+","+info[2]+",");
                });
                var who = socket_to_instanceid.get(sent_id);
                var NEW = [who[0],who[1],who[2],who[3],who[4],info[1],info[2],who[7],who[8], who[9]];
                socket_to_instanceid.set(sent_id, NEW);
                [...clients.keys()].forEach((client) => {
                    client.send("0500"+sent_id+",ALL,");
                });
                who = socket_to_instanceid.get(sent_id);
                NEW = [who[0],who[1],who[2],who[3],who[4],who[5],who[6],"00",who[8], who[9]];
                socket_to_instanceid.set(sent_id, NEW);
            }
            if(info[0] == 5){
                [...clients.keys()].forEach((client) => {
                    client.send("10"+sent_id+","+info[1]+",");
                });
            }
            if(info[0] == 6){
                [...clients.keys()].forEach((client) => {
                    client.send("11"+info[1]+","+info[2]+",");
                });
            }
            if(info[0] == 7){
                [...clients.keys()].forEach((client) => {
                    client.send("12"+sent_id+","+info[1]+",");
                });
            }
            if(info[0] == 8){
                [...clients.keys()].forEach((client) => {
                    client.send("13"+info[1]);
                });
            }
            if(info[0] == 9){
                if (socket_to_instanceid.has(sent_id)){
                    [...clients.keys()].forEach((client) => {
                        client.send("0510"+sent_id+",ALL,");
                    });
                    var name = socket_to_instanceid.get(sent_id);
                    console.log("> "+JSON.stringify(id)+" disconnect!");
                    socket_to_instanceid.delete(sent_id);
                    socket_list = socket_list.filter(function(value, index, arr){ 
                        return value != sent_id;
                    });
                    clients.delete(ws);
                    [...clients.keys()].forEach((client) => {
                        client.send("04 <<< "+name[0]+" has left the lobby!");
                    });
                }
            }
            if(info[0] == 10){
                var who = socket_to_instanceid.get(sent_id);
                var NEW = [who[0],who[1],who[2],who[3],who[4],who[5],who[6],who[7],who[8], info[1]];
                socket_to_instanceid.set(sent_id, NEW);
                [...clients.keys()].forEach((client) => {
                    client.send("14"+sent_id+","+info[1]+",");
                });
                socket_to_instanceid.set(sent_id, NEW);
            }
        }
    });
    ws.on("close", () => {
        if (socket_to_instanceid.has(sent_id)){
            [...clients.keys()].forEach((client) => {
                client.send("0510"+sent_id+",ALL,");
            });
            var name = socket_to_instanceid.get(sent_id);
            console.log("> "+JSON.stringify(id)+" disconnect!");
            socket_to_instanceid.delete(sent_id);
            socket_list = socket_list.filter(function(value, index, arr){ 
                return value != sent_id;
            });
            clients.delete(ws);
            [...clients.keys()].forEach((client) => {
                client.send("04 <<< "+name[0]+" has left the lobby!");
            });
        }
    });
});
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}