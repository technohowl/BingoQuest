
import { EventEmitter } from "events";
import { GameModelData } from "@models/game-model.data";
import { Resources } from "@app/utils/resources.utils";
import { Texture } from "pixi.js";

export class FacebookInstant extends EventEmitter {

    public static _instance: FacebookInstant;

    private _online: boolean;
    private leaderboardImages: Map<string, Texture>;
    private intAd: FBInstant.AdInstance;
    private rewardAd: FBInstant.AdInstance;

    private constructor() {
        super();
        this._online = true;
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

    public startGame(callback: () => void): void {
        if (!this._online) {
            callback();
            return;
        }
        FBInstant.startGameAsync().then(callback)
            .then( () => {
                // this.ID = FBInstant.context.getID();
                // this.playerName = FBInstant.player.getName();
                // this.playerId = FBInstant.player.getID();
                this.cacheRewarded(Resources.getConfig().ads.game);
                this.cacheInterstitialAd(Resources.getConfig().ads.interstitial, () => {

                }, (data: any) =>{
                    console.log("Failed to load interstitial:" , data);
                });
                this.addEvents();
            } )
            .catch((reason: any) => {
                console.log(reason);
            });
    }

    private addEvents(): void {
        GameModelData.instance.on("bingos", (value: number) => {
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

    public createShortcut():void {
        FBInstant.canCreateShortcutAsync()
                .then(function(canCreateShortcut) {
                    if (canCreateShortcut) {
                    FBInstant.createShortcutAsync()
                        .then(function() {
                        // Shortcut created
                        })
                        .catch(function() {
                        // Shortcut not created
                        });
                    }
                });
    }

    //tarun added weekly scoring
    public addScore(value: number, callback: (data: any) => void): void {
        FBInstant.getLeaderboardAsync(Resources.getConfig().leaderboard.global)
            .then((leaderboard) => {
                leaderboard.setScoreAsync(value).then((entry) => {
                    console.log("leaderboard:", entry);
                    FBInstant.getLeaderboardAsync(Resources.getConfig().leaderboard.weekly).then((weekylyLeaderboard) => {
                        callback(weekylyLeaderboard.setScoreAsync(value));
                    });
                });

            })
            .catch((reason: any) => {
                console.log(reason);
            });
    }

    public getGlobalScore(page: number, total: number, callback: (entries: FBInstant.LeaderboardEntry[]) => void): void {
        FBInstant
            .getLeaderboardAsync(Resources.getConfig().leaderboard.global)
            .then((leaderboard) => leaderboard.getEntriesAsync(total, page * total))
            .then((entries) => callback(entries))
            .catch((reason: any) => {
                console.log(reason);
            });
    }
    public getWeeklyScore(page: number, total: number, callback: (entries: FBInstant.LeaderboardEntry[]) => void): void {
        FBInstant
            .getLeaderboardAsync(Resources.getConfig().leaderboard.weekly)
            .then((leaderboard) => leaderboard.getEntriesAsync(total, page * total))
            .then((entries) => callback(entries))
            .catch((reason: any) => {
                console.log(reason);
            });
    }
    public getFriendsScore(page: number, total: number, callback: (entries: FBInstant.LeaderboardEntry[]) => void): void {
        FBInstant
            .getLeaderboardAsync(Resources.getConfig().leaderboard.global)
            .then( (leaderboard: any) => {
                console.log(leaderboard);
                return leaderboard.getConnectedPlayerEntriesAsync(5, 0);
            } )
            .then((leaderboard) => leaderboard.getEntriesAsync(total, page * total))
            .then((entries) => callback(entries))
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

    public isRewardedAdAvailable(): Boolean {
        return this.rewardAd == null;
    }

    public cacheRewarded(id: string):void {
        FBInstant.getRewardedVideoAsync(id)
            .then((rewardedVideo: FBInstant.AdInstance) => {
                this.rewardAd = rewardedVideo;
                return this.rewardAd.loadAsync();
            });
    }
    public playVideo(onComplete: () => void, onFail: (data: any) => void): void {

        if (!this.isOnline) {
            onComplete();
            return;
        }

        if(this.rewardAd == null){
            onFail("Not available.");
            return;
        }

        this.rewardAd.showAsync()
            .then(() => {
                this.rewardAd = null;
                this.cacheRewarded(Resources.getConfig().ads.game);
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

        FBInstant.getInterstitialAdAsync(
            id,
        )
            .then((interAd: FBInstant.AdInstance) => {
                this.intAd = interAd;
                console.log(this.intAd);
                return this.intAd.loadAsync();
            }).then(() => {
            console.log('loaded');
            onComplete();
        }).catch((err : Error) => {
            onFail(err);
        });
    }
    showInterstitialAd(onComplete: () => void): void {

        if (!this.isOnline) {
            onComplete();
            return;
        }
        if(this.intAd == null){
            onComplete();
            return;
        }
        this.intAd.showAsync().then(()=>{
            this.intAd = null;
            this.cacheInterstitialAd(Resources.getConfig().ads.interstitial, () => {}, () => {});
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
                callback();
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
            text: Resources.getConfig().templates.template1.text,
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
            text: Resources.getConfig().templates.template1.text,
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

    public getPlayerImage(player: FBInstant.LeaderboardPlayer): Texture {
        if (this.leaderboardImages.has(player.getID())) {
            return this.leaderboardImages.get(player.getID());
        }

        const text: Texture = Texture.fromImage(player.getPhoto());
        this.leaderboardImages.set(player.getID(), text);

        return text;
    }

}
