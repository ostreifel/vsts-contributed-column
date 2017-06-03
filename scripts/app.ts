///<reference types="vss-web-extension-sdk" />
import * as Q from "q";

export interface IContributedQueryResultColumnValue {
    title: string;
    image: string;
    onClick: () => IPromise<void>;
}
var actionProvider =  {
    getValue: (wiData: {[id: number]: {[refName: string]: any}}) => {
        const results: {[id: number]: IContributedQueryResultColumnValue} = {};
        for (const id in wiData) {
            results[id] = {
                title: `Hello ${id} from extension`,
                image: "http://batzner.com/blog/wp-content/uploads/2011/11/bed-bug.jpg",
                onClick: () => {
                    alert("Hello from alert");
                    return Q();
                }
            };
        }
        return results;
    }
};

// Register context menu action provider
VSS.register(VSS.getContribution().id, actionProvider);
