//import axios from 'axios';
import {GameModelData} from '@models/game-model.data';

export class RestApiService {
    private static _instance:RestApiService;

    private constructor() {
        GameModelData.instance.onUserSave(this.onUserSave);
    }

    static get instance():RestApiService {
        console.log("Instance created of restful service");
        if(!RestApiService._instance) {
            RestApiService._instance = new RestApiService(

            );
        }
        return RestApiService._instance;
    }


    saveUserData(callback: () => void): void {
        FBInstant.player.getSignedPlayerInfoAsync(JSON.stringify(GameModelData.instance.props))
            .then(function (result) {
                result.getPlayerID(); // same value as FBInstant.player.getID()
                //MyServer.send(result.getSignature());
                console.log("Signed data:", result);
                return Promise.resolve(RestApiService._instance.sendUserData(result));
            }).then((data) => {
            console.warn("Response receied:", data);
            callback();
        });

    }

    async sendUserData(_result: any): Promise < any > {
        /*
           var payload = {
             'contextId': FBInstant.context.getID(),
             'signature': _result.getSignature(),
             'player': _result.getPlayerID(),
             'gameId': '678422225998720',
             'gameName': 'Bingo Quest'
           };

          try {
             let result = await axios.post("https://eeos9or4f2.execute-api.us-west-2.amazonaws.com/dev/bingo/reward/saveUserData", payload, {
               headers: {
                 'Content-Type': 'application/json',
                 "Access-Control-Allow-Origin": "*"
               }
             });

             return await result.data;
           } catch (err) {
             return err.message || "failed to post user data";
           }
         }
      */
    }
    onUserSave(callback:()=>void){
        console.warn("Emitting Received");
        RestApiService._instance.saveUserData(callback);
    }


}
