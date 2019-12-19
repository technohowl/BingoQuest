import {Resources} from "@app/utils/resources.utils";
import {ContainerComponent} from "@app/components/container.component";

export class LocaleHelper extends ContainerComponent{

    private static instance: LocaleHelper;
    private  locale: string;
    public static get Instance():LocaleHelper {
        if(this.instance == null) {
            this.instance = new LocaleHelper();
        }
        return this.instance;
    }

    public initialize():void {
        this.locale = FBInstant.getLocale() || "en-US";
        //this.locale =  "es-US";
    }

    getLocale(text: string): string{
        if(this.locale.localeCompare("en-US"))
            return text;
        if(Resources.getLocale().hasOwnProperty(this.locale)){
            return Resources.getLocale()[this.locale][text];
        }
        return text;
    }
}
