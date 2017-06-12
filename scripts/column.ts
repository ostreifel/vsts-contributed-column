///<reference types="vss-web-extension-sdk" />
import * as Q from "q";
import { WorkItemExpand } from "TFS/WorkItemTracking/Contracts";
import { getClient as getWitClient } from "TFS/WorkItemTracking/RestClient";
import { GitPullRequest, PullRequestStatus } from "TFS/VersionControl/Contracts";
import { getClient as getGitClient } from "TFS/VersionControl/GitRestClient";
import { getPullRequestImage } from "./prIcon";
import { CachedValue } from "./CachedValue";

export interface IContributedQueryResultColumnValue {
    title?: string;
    image?: string;
    onClick?: () => IPromise<void>;
}
const prRegex = new RegExp("^vstfs:///Git/PullRequestId/(.+)%2F(.+)%2F(.+)$");

function extractPrDetails(url: string, prCache: {[url: string]: CachedValue<GitPullRequest | void>}): IPromise<GitPullRequest | void> {
    const match = url.match(prRegex);
    if (!match) {
        return Q();
    }
    if (!(url in prCache)) {
        const [, projectId, repositoryId, pullRequestIdStr] = match;
        const pullRequestId = Number(pullRequestIdStr);
        prCache[url] = new CachedValue(() => getGitClient().getPullRequest(repositoryId, pullRequestId));
    }
    return prCache[url].getValue();
}


const actionProvider = {
    getValue: (wiData: { [id: number]: { [refName: string]: any } }) => {
        return getWitClient().getWorkItems(Object.keys(wiData).map(id => Number(id)), undefined, undefined, WorkItemExpand.Relations).then(wis => {
            const results: { [id: number]: IContributedQueryResultColumnValue } = {};
            /** Cache but only for the getValue durations */
            const prCache: {[url: string]: CachedValue<GitPullRequest>} = {};
            return Q.all(wis.map(wi => {
                const allPullRequests = (wi.relations || [])
                    .filter(r => r.rel === "ArtifactLink" &&
                        r.url.match(prRegex)).map(({ url }) => extractPrDetails(url, prCache));
                return Q.all(allPullRequests).then((allPrs) => {
                    const prs = allPrs.filter(pr => !!pr) as GitPullRequest[];
                    if (prs.length === 0) {
                        results[wi.id] = {
                            title: "No associated pull request",
                        };
                    } else {
                        const pr = prs[0];
                        results[wi.id] = {
                            title: `${pr.title}${prs.length > 1 ? `1/${prs.length}` : ""}`,
                            image: getPullRequestImage(pr)
                        };
                    }
                });
            })).then(() => results);
        });
    }
};

// Register context menu action provider
VSS.register(VSS.getContribution().id, actionProvider);
