import {EventEmitter} from "events";
import {GameModelData} from "@models/game-model.data";
import {Resources} from "@app/utils/resources.utils";
import {Texture} from "pixi.js";
import {LocaleHelper} from "@app/components/locale.componenet";
import {Helper} from "@app/utils/helper.utils";
import Product = FBInstant.Product;
import Purchase = FBInstant.Purchase;
import {Log} from "@app/utils/Log";
//import {LogLevel} from "@timberio/types";


export class FacebookInstant extends EventEmitter {

    public static _instance: FacebookInstant;

    private _online: boolean;
    private _adCount: boolean;
    private leaderboardImages: Map<string, Texture>;
    private intAd: FBInstant.AdInstance;
    private rewardAd: FBInstant.AdInstance;
    private rewardAdExtraBall: FBInstant.AdInstance;
    private rewardAdPowerUp: FBInstant.AdInstance;

    private isRewardedAdLoaded: boolean;
    private isRewardedAdExtaBallLoaded: boolean;
    private isRewardedAdPowerUp: boolean;
    private isInterstitialLoaded: boolean;

    private constructor() {
        super();
        this._online = true;
        this._adCount = false;
        this.isRewardedAdLoaded = false;
        this.isRewardedAdExtaBallLoaded = false;
        this.isRewardedAdPowerUp = false;
        this.isInterstitialLoaded = false;

        this.leaderboardImages = new Map<string, Texture>();
    }

    public static get instance(): FacebookInstant {
        if (!FacebookInstant._instance) {
            FacebookInstant._instance = new FacebookInstant();
        }
        return FacebookInstant._instance;
    }

    get contextId(): string {
        return FBInstant.context.getID();
    }
    get getId(): string {
        return FBInstant.player.getID();
    }

    public initializeAPI(onInitialize: () => void): void {
        if (!this._online) {
            onInitialize();
            return;
        }
        FBInstant.initializeAsync()
            .then(onInitialize)
            .catch((reason: any) => {
                console.log(reason);
            });
    }
    get entryPoint(): any {
        return FBInstant.getEntryPointData();
    }
    public setProgress(value: number): void {
        if (!this._online) {
            return;
        }
        FBInstant.setLoadingProgress(value);
    }
/*
    public sendLog(data: any, logLevel: LogLevel = LogLevel.Info){
        this.logger.log(data, logLevel).then(_=>{

        });
    }*/

    public startGame(callback: () => void): void {
        if (!this._online) {
            callback();
            return;
        }
        FBInstant.startGameAsync()
            .then( () => {
                // this.ID = FBInstant.context.getID();
                // this.playerName = FBInstant.player.getName();
                // this.playerId = FBInstant.player.getID();

                return this.getPlayerWeeklyScore(entry => {

                    //console.log("Weekly score:", entry);
                    // get ebtry from leaderboard and save temp in gameModel.
                    GameModelData.instance.playerWeekScore = entry == null ? 0 : entry.getScore() || 0;
                    Helper.log( `Weekly Score: ${GameModelData.instance.playerWeekScore}`);
                    /**/
                    this.cacheRewarded(Resources.getConfig().ads.powerup, ()=>{
                       setTimeout(this.cacheRewarded.bind(this, Resources.getConfig().ads.game, () =>{
                           setTimeout(this.cacheInterstitialAd.bind(this, Resources.getConfig().ads.interstitial, () =>{

                           }, (error:Error)=>{
                               Log.instance.log("Error in interstitial", error.message);
                           }), 1000);
                       }), 1000);
                    });

                    this.addEvents();
                    this.getContextScore(()=>{
                        callback();
                    });
                });

            } )
            .catch((reason: any) => {
                console.log(reason);
                //this.sendLog(`startGameAsync: ${reason}`, LogLevel.Error);
            });
    }

    private addEvents(): void {
        GameModelData.instance.on('bingos', (value: number) => {
            FacebookInstant.instance.addScore(value, (data: any) => {
                console.log("score saved", data);
            });
        });
    }

    public getData(callback: (data: any) => void): void {
        if (!this._online) {
            callback({});
            return;
        }
        FBInstant.player.getDataAsync(Object.keys(GameModelData.instance.props))
            .then(callback)
            .catch((reason: any) => {
                console.log(reason);
            });
    }
    public saveData(data: any, callback: () => void): void {
        if (!this._online) {
            callback();
            return;
        }
        FBInstant.player.setDataAsync(data)
            .then(callback)
            .catch((reason: any) => {
                console.log(reason);
            });
    }

    public saveAllData(callback: () => void): void {
        if (!this._online) {
            callback();
            return;
        }
        FacebookInstant.instance.saveData(GameModelData.instance.props, callback);
    }

    get isOnline(): boolean {
        return this._online;
    }
    set isOnline(value: boolean) {
        this._online = value;
    }

    get isGamePlayed(): boolean {
        return this._adCount;
    }
    set isGamePlayed(value: boolean) {
        this._adCount = value;
    }

    public logEvent( eventName:string, value?:number ):void{
        FBInstant.logEvent(
            eventName,
            value
        );
    }

    public openGame(gameId: string, callback: ()=> void):void{
        FBInstant
            .switchGameAsync(gameId)
            .then(function() {
                console.log(FBInstant.context.getID());
                callback();
                // 1234567890
            });
    }

    public createShortcut():void {
        FBInstant.canCreateShortcutAsync()
                .then(function(canCreateShortcut) {
                    if (canCreateShortcut) {
                        FBInstant.createShortcutAsync()
                            .then(function() {
                                window.localStorage.setItem('shortcut', "1");

                            // Shortcut created
                            })
                            .catch(function() {
                            // Shortcut not created
                            window.localStorage.setItem('shortcut', "1");
                        });
                    }
                });
    }

    //tarun added weekly scoring
    public addScore(value: number, callback: (data: any) => void): void {
        //console.log("Adding score:", value, GameModelData.instance.weeklyScore, GameModelData.instance.playerContextScore);
        FBInstant.getLeaderboardAsync(Resources.getConfig().leaderboard.global)
            .then((leaderboard) => {
                leaderboard.setScoreAsync(value).then((_) => {
                    //console.log("leaderboard updated:");
                    FBInstant.getLeaderboardAsync(Resources.getConfig().leaderboard.weekly).then((weekylyLeaderboard) => {
                        if(FBInstant.context.getID() !=null){
                            weekylyLeaderboard.setScoreAsync(GameModelData.instance.weeklyScore).then((_)=>{
                                /*FBInstant.getLeaderboardAsync(`${Resources.getConfig().leaderboard.group}${FBInstant.context.getID()}`).then((groupLoeaderboard) => {
                                    callback(groupLoeaderboard.setScoreAsync(value));
                                });*/
                                //console.log("Updating leaderboard :", Resources.getConfig().leaderboard.group,FBInstant.context.getID());

                                FBInstant.getLeaderboardAsync(`${Resources.getConfig().leaderboard.group}${FBInstant.context.getID()}`).then((groupLoeaderboard) => {
                                    groupLoeaderboard.setScoreAsync(GameModelData.instance.playerContextScore).then(_=>{
                                        console.warn("Updated score leaderboard :", Resources.getConfig().leaderboard.group,FBInstant.context.getID());
                                        FBInstant.updateAsync({
                                            action: "LEADERBOARD",
                                            name: `${Resources.getConfig().leaderboard.group}${FBInstant.context.getID()}`
                                        }).then((entryData)=>{
                                            console.warn("Context leaderbaord upadted:", entryData);
                                            callback(entryData);
                                        });
                                    });
                                });

                            });

                        }else {
                            console.warn("weekly leaderboard updated:", GameModelData.instance.weeklyScore);
                            callback(weekylyLeaderboard.setScoreAsync(GameModelData.instance.weeklyScore));
                        }
                    });
                });

            })
            .catch((reason: any) => {
                console.log(reason);
                callback(null);
                //his.sendLog(reason, LogLevel.Error);
            });
    }

    public getGlobalScore(page: number, total: number, callback: (entries: FBInstant.LeaderboardEntry[]) => void): void {
        FBInstant
            .getLeaderboardAsync(Resources.getConfig().leaderboard.global)
            .then((leaderboard) => {return leaderboard.getEntriesAsync(total, page * total)})
            .then((entries) => callback(entries))
            .catch((reason: any) => {
                console.log(reason);
            });
    }
    public getWeeklyScore(page: number, total: number, callback: (entries: FBInstant.LeaderboardEntry[]) => void): void {
        FBInstant
            .getLeaderboardAsync(Resources.getConfig().leaderboard.weekly)
            .then((leaderboard) => {return leaderboard.getEntriesAsync(total, page * total)})
            .then((entries) => callback(entries))
            .catch((reason: any) => {
                console.log(reason);
            });
    }
    public getPlayerStats( callback: (entries: FBInstant.StatsObject) => void, keys?:Array<string>): void {
        FBInstant.player
            .getStatsAsync(keys)
            .then((stats) => {callback(stats)})
            .catch((reason: any) => {
                console.log(reason);
            });
    }

    public incPlayerStats(data:any, callback: () => void): void {
        FBInstant.player
            .incrementStatsAsync(data)
            .then(() => {callback()})
            .catch((reason: any) => {
                console.log(reason);
                callback();
            });
    }
    public  getFriendsScore(page: number, total: number, callback: (entries: FBInstant.LeaderboardEntry[]) => void): void {
        FBInstant
            .getLeaderboardAsync(Resources.getConfig().leaderboard.weekly)
            .then( (leaderboard: any) => {
                console.log(leaderboard);
                return leaderboard.getConnectedPlayerEntriesAsync(total, page * total);
            } )
            .then((entries) => callback(entries))
            .catch((reason: any) => {
                console.log(reason);
            });
    }

    public getContextLeaderboard(page: number, total: number, callback: (entries: FBInstant.LeaderboardEntry[]) => void): void {
        //console.log("Getting context leaderboard:");
        FBInstant
            .getLeaderboardAsync(`${Resources.getConfig().leaderboard.group}${FBInstant.context.getID()}`)
            .then((leaderboard) =>
            {
                console.log("context leaderboard:", leaderboard);

                return leaderboard.getEntriesAsync(total, page * total)
            })
            .then((entries) => {
                console.log("context leaderboard:", entries.length);

                callback(entries);
            })
            .catch((reason: any) => {
                console.log(reason);
            });
    }

    public  getConnectedPlayers(callback: (entries: FBInstant.ContextPlayer[]) => void): void {
        FBInstant
            .context.getPlayersAsync()
            .then( (players: any) => {
                console.log(players);
                callback(players)
            } )

            .catch((reason: any) => {
                console.log(reason);
            });
    }

    public getPlayerScore(callback: (entries: FBInstant.LeaderboardEntry) => void): void {
        FBInstant.getLeaderboardAsync(Resources.getConfig().leaderboard.global)
            .then( (leaderboard: any) => leaderboard.getPlayerEntryAsync())
            .then((entry: FBInstant.LeaderboardEntry) => callback(entry))
            .catch((error: any) => console.log(error));
    }

    public getPlayerWeeklyScore(callback: (entries: FBInstant.LeaderboardEntry) => void): void {
        FBInstant.getLeaderboardAsync(Resources.getConfig().leaderboard.weekly)
            .then( (leaderboard: any) => leaderboard.getPlayerEntryAsync())
            .then((entry: FBInstant.LeaderboardEntry) => callback(entry))
            .catch((error: any) => {
                console.log(error);
                throw error;
            });
    }

    public isRewardedAdAvailable(id: string): Boolean {
        if(id === (Resources.getConfig().ads.powerup) ){
            return this.isRewardedAdPowerUp;
        }
        else if(id === (Resources.getConfig().ads.extraballs) ){
            return this.isRewardedAdExtaBallLoaded;
        }else {
            return this.isRewardedAdLoaded;
        }
    }

    public cacheRewarded(id: string, onComplete: () => void):void {
        //console.log("Rewarded video cache started:" , id);
        //Helper.log("Rewarded video cache started:"+ id);

        FBInstant.getRewardedVideoAsync(id)
            .then((rewardedVideo: FBInstant.AdInstance) => {
                //console.log("Rewarded video getRewardedVideoAsync:" , id);
                Helper.log("Rewarded video getRewardedVideoAsync:" , id);
                if(id === Resources.getConfig().ads.powerup) {
                    this.rewardAdPowerUp = rewardedVideo;
                    this.rewardAdPowerUp.loadAsync().then(() => {
                        this.isRewardedAdPowerUp = true;
                        //Log.Instance.log("Rewarded extra power up loaded:" , id);
                        onComplete();
                    }).catch((error:any)=>{
                        Log.Instance.log("Rewarded video error 0:" , error.message);
                        onComplete();
                    });
                }
                else if(id === Resources.getConfig().ads.extraballs) {
                    this.rewardAdExtraBall = rewardedVideo;
                    this.rewardAdExtraBall.loadAsync().then(() => {
                        this.isRewardedAdExtaBallLoaded = true;
                        //Log.Instance.log("Rewarded extra video loaded:" , id);
                        onComplete();
                    }).catch((error:any)=>{
                        Log.Instance.log("Rewarded video error 1:" , error.message);
                        onComplete();
                    });
                }
                else {
                    this.rewardAd = rewardedVideo;
                    this.rewardAd.loadAsync().then(() => {
                        this.isRewardedAdLoaded = true;
                        //Log.Instance.log("Rewarded video loaded id:" , id);
                        onComplete();
                    }).catch((error:any)=>{
                        Log.Instance.log("Rewarded video error 2:" , error.message);
                        onComplete();
                    });
                }


            }).catch((error:any)=>{
            Helper.log("Rewarded video error:" , error);
            onComplete();
        });
    }



    public showRewardedAd(id:string, onComplete: () => void, onFail: (data:any) => void):void{
        if (!this.isOnline) {
            onComplete();
            return;
        }
        if(id === (Resources.getConfig().ads.powerup) ){
            this.playRewardedPowerUp(onComplete, onFail);

        }
        else if(id === (Resources.getConfig().ads.extraballs) ){
            this.playextraballsVideo(onComplete, onFail);

        }else {
            this.playVideo(onComplete, onFail);
        }
    }

    public playRewardedPowerUp(onComplete: () => void, onFail: (data: any) => void): void {
        if(!this.isRewardedAdPowerUp){
            onFail("Not available.");
            return;
        }

        this.rewardAdPowerUp.showAsync()
            .then(() => {
                this.rewardAdPowerUp = null;
                this.isRewardedAdPowerUp = false;
                //this.cacheRewarded(Resources.getConfig().ads.extraballs);
                this.cacheRewarded(Resources.getConfig().ads.powerup, ()=>{});
                onComplete();
            })
            .catch((reason: any) => {
                console.log(reason);
                onFail(reason);
            });

    }

    public playextraballsVideo(onComplete: () => void, onFail: (data: any) => void): void {
        if(!this.isRewardedAdExtaBallLoaded){
            onFail("Not available.");
            return;
        }

        this.rewardAdExtraBall.showAsync()
            .then(() => {
                this.rewardAdExtraBall = null;
                this.isRewardedAdExtaBallLoaded = false;
                //this.cacheRewarded(Resources.getConfig().ads.extraballs);
                onComplete();
            })
            .catch((reason: any) => {
                console.log(reason);
                onFail(reason);
            });

    }

    public playVideo(onComplete: () => void, onFail: (data: any) => void): void {
        if(!this.isRewardedAdLoaded){
            onFail("Not available.");
            return;
        }

        this.rewardAd.showAsync()
            .then(() => {
                this.rewardAd = null;
                this.isRewardedAdLoaded = false;
                this.cacheRewarded(Resources.getConfig().ads.game, ()=>{

                });
                onComplete();
            })
            .catch((reason: any) => {
                console.log(reason);
                onFail(reason);
            });

    }


    getScore(callback: (entries: Array < FBInstant.LeaderboardEntry > ) => void): void {
        FBInstant
            // .getLeaderboardAsync('weekly.÷' + FBInstant.context.getID())
            .getLeaderboardAsync('global')
            .then(leaderboard => leaderboard.getEntriesAsync(10, 0))
            .then(entries => callback(entries))
            .catch((reason: any) => {
                console.log(reason);
            })
    }

    cacheInterstitialAd(id: string, onComplete: () => void, onFail: (data: any) => void): void {
        if (!this.isOnline) {
            onComplete();
            return;
        }

        FBInstant.getInterstitialAdAsync(id)
            .then((interAd: FBInstant.AdInstance) => {
                this.intAd = interAd;
                console.log(this.intAd);
                return this.intAd.loadAsync().then(()=>{
                    this.isInterstitialLoaded = true;
                    onComplete();
                });
            }).catch((err : Error) => {
                onFail(err);
        });
    }
    showInterstitialAd(onComplete: () => void): void {
        if (!this.isOnline) {
            onComplete();
            return;
        }
        if((this.intAd == null || !this.isInterstitialLoaded)){
            onComplete();
            return;
        }
        this.isGamePlayed = false;
        this.intAd.showAsync().then(()=>{
            this.intAd = null;
            this.isInterstitialLoaded = false;
            this.cacheInterstitialAd(Resources.getConfig().ads.interstitial, () => {}, (_:Error) => {});
            onComplete();
        }).catch((_:Error)=>{
            onComplete();
        });
    }

    //tarun bot confirmation
    public showBot(callback: () => void): void {
        FBInstant.getSupportedAPIs();
        FBInstant.player.canSubscribeBotAsync()
            .then(function (can_subscribe) {
                if (can_subscribe) {
                    FBInstant.player.subscribeBotAsync().then(()=> {
                        // Player is subscribed to the bot
                        callback();
                    });
                }else{
                    callback();
                }
        }).catch((error)=>{
            console.error("Error in show bot: ", error);
            callback();
        });
// Then when you want to ask the player to subscribe

    }

    public addPause(callback: () => void): void {
        FBInstant.onPause( () => callback());
    }
    public removePause(): void {
        FBInstant.onPause( () => {} );
    }

    public inviteSocial(callback:() => void):void{
        FBInstant.context.chooseAsync()
            .then(()=>{
                this.getContextScore(callback);
            })
    }

    public startMatchmaking(callback: (value: string) => void): void {
        FBInstant.matchPlayerAsync(null, true, true)
            .then( () => callback(FBInstant.context.getID()));
    }

    public share(callback: () => void): void {
        FBInstant.shareAsync({
            intent: "REQUEST",
            image: Resources.getConfig().templates.template1.image,
            text: `${LocaleHelper.Instance.getLocale("join_game")}`,
            data: {
                invite: "new-player-from-shared"
            }
        })
            .then(() => callback())
            .catch((value: any) => console.log(value));
    }

    public updateStatus(callback: () => void): void {
        FBInstant.updateAsync({
            action: "CUSTOM",
            cta: Resources.getConfig().templates.template1.cta,
            image: Resources.getConfig().templates.template1.image,
            text: `${LocaleHelper.Instance.getLocale("join_game")}`,
            template: Resources.getConfig().templates.template1.name,
            data: {
                invite: Resources.getConfig().templates.template1.prize
            },
            strategy: "IMMEDIATE",
            notification: "NO_PUSH"
        })
            .then(() => callback())
            .catch((value: any) => console.log(value));
    }

    public sendUpdate(text:string, callback: () => void): void {
        FBInstant.updateAsync({
            action: "CUSTOM",
            cta: Resources.getConfig().templates.template2.cta,
            image: Resources.getConfig().templates.template2.image,
            text: text,
            template: Resources.getConfig().templates.template2.name,

            strategy: "IMMEDIATE",
            notification: "NO_PUSH"
        })
            .then(() => callback())
            .catch((value: any) => console.log(value));
    }

    public getPlayerImage(player: FBInstant.LeaderboardPlayer): Texture {
        if (this.leaderboardImages.has(player.getID())) {
            return this.leaderboardImages.get(player.getID());
        }

        const text: Texture = Texture.fromImage(player.getPhoto());
        this.leaderboardImages.set(player.getID(), text);

        return text;
    }

    public switchAsync(id: string, callback: () => void):void {
        FBInstant.context.createAsync(id)
            .then(() => {
                this.getContextScore(callback);

                }

            )
            .catch((value: any) => console.log(value));
    }

    public getContextScore(callBack:()=>void):void {
        console.warn("getContextScore player stats:");
        if(FacebookInstant.instance.contextId != null){
            let data: string[] = [
                `${FacebookInstant.instance.contextId.toString()}`
                //`${Resources.getConfig().leaderboard.weekly}`
            ];
            try {
                FacebookInstant.instance.getPlayerStats(entries => {
                    console.warn("Received player stats:", entries);
                    GameModelData.instance.playerContextScore = entries[`${FacebookInstant.instance.contextId.toString()}`];
                    //GameModelData.instance.weeklyScore = entries[`${Resources.getConfig().leaderboard.weekly}`];
                    callBack();
                }, data);
            } catch (e) {
                console.error("Error in getting player stats:", e);
                callBack();
            }

        }else {
            callBack();
        }
    }

    public getInappCatalog(callback: (products: Product[]) => void):void{
        try {
            FBInstant.payments.getCatalogAsync().then(function(catalog) {
                //console.log(catalog); // [{productID: '12345', ...}, ...]
                callback(catalog);
            });
        }catch (e) {
            console.error("Error in getting catalog stats:", e);
            callback(null);
        }
    }

    public buyInappItem(product: Product, callback: (result: Purchase) => void):void{
        try {
            FBInstant.payments.purchaseAsync({
                productID: product.productID
            }).then(function(catalog) {
                console.log(catalog); // [{productID: '12345', ...}, ...]
                Log.Instance.log("Buy Inapp", catalog);
                callback(catalog);
            });
        }catch (e) {
            console.error("Error in getting catalog stats:", e);
            callback(null);
        }
    }

    public consumeItem(token: string, callback:()=>void):void{
        try {
            FBInstant.payments.consumePurchaseAsync(token).then(function () {
                callback();
            });
        }catch (e) {
            callback();
        }
    }
}
