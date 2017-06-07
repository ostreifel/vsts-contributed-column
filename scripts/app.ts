///<reference types="vss-web-extension-sdk" />
import * as Q from "q";
import { WorkItemExpand } from "TFS/WorkItemTracking/Contracts";
import { getClient } from "TFS/WorkItemTracking/RestClient";

export interface IContributedQueryResultColumnValue {
    title?: string;
    image?: string;
    onClick?: () => IPromise<void>;
}
var actionProvider = {
    getValue: (wiData: { [id: number]: { [refName: string]: any } }) => {
        return getClient().getWorkItems(Object.keys(wiData).map(id => Number(id)), undefined, undefined, WorkItemExpand.Relations).then(wis => {
            const results: { [id: number]: IContributedQueryResultColumnValue } = {};
            for (const wi of wis) {
                const allAttachmentNames = (wi.relations || [])
                    .filter(r => r.rel === "AttachedFile" && r.attributes && r.attributes.name).map(r => r.attributes.name);
                const pngs = allAttachmentNames.filter(n => n.match("\.png$"));
                if (pngs.length > 0)  {
                    results[wi.id] = {
                        title: `${pngs.length} png files`,
                        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Picture_icon_BLACK.svg/677px-Picture_icon_BLACK.svg.png",
                        onClick: () => {
                            alert(`Found images ${pngs.join(", ")}`);
                            return Q();
                        }
                    };
                } else if (pngs.length === 0)  {
                    results[wi.id] = {
                        title: `No images available`
                    };
                }
            }
            return results;
        });
    }
};

// Register context menu action provider
VSS.register(VSS.getContribution().id, actionProvider);
