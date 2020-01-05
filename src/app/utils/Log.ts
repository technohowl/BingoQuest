import {Timber} from "@timberio/node";
export class Log{

    private logger: Timber;
    public static instance: Log;


    public static get Instance(): Log {
        if (!Log.instance) {
            Log.instance = new Log();
        }
        return Log.instance;
    }

    private constructor() {
        this.logger = new Timber("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2FwaS50aW1iZXIuaW8vIiwiZXhwIjpudWxsLCJpYXQiOjE1NzcwMDI2ODEsImlzcyI6Imh0dHBzOi8vYXBpLnRpbWJlci5pby9hcGlfa2V5cyIsInByb3ZpZGVyX2NsYWltcyI6eyJhcGlfa2V5X2lkIjo0NTIxLCJ1c2VyX2lkIjoiYXBpX2tleXw0NTIxIn0sInN1YiI6ImFwaV9rZXl8NDUyMSJ9.oFVim2193TrwYEI_6UZwizKftYOiexSGjtNKx4IJAiA",
            "25818");
    }

    public log(...logData:any[]){
        this.logger.debug("Bingo: "+logData.toString());
    }
    public info(...logData:any[]){
        this.logger.info("Bingo: "+logData.toString());
    }
    public warn(...logData:any[]){
        this.logger.warn("Bingo: "+logData.toString());
    }
    public error(...logData:any[]){
        this.logger.error("Bingo: "+logData.toString());
    }
}
