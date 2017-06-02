///<reference types="vss-web-extension-sdk" />

export interface IContributedQueryResultColumnValue {
    title: string;
}
var actionProvider =  {
    getValue: (wiData: {[id: number]: {[refName: string]: any}}) => {
        const results: {[id: number]: IContributedQueryResultColumnValue} = {};
        for (const id in wiData) {
            results[id] = {
                title: `Hello ${id} from extension`
            };
        }
        return results;
    }
};

// Register context menu action provider
VSS.register(VSS.getContribution().id, actionProvider);
