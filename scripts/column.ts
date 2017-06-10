///<reference types="vss-web-extension-sdk" />
import * as Q from "q";
import { WorkItemExpand } from "TFS/WorkItemTracking/Contracts";
import { getClient as getWitClient } from "TFS/WorkItemTracking/RestClient";
import { GitPullRequest, PullRequestStatus } from "TFS/VersionControl/Contracts";
import { getClient as getGitClient } from "TFS/VersionControl/GitRestClient";
import { getPullRequestImage } from "./prIcon";

export interface IContributedQueryResultColumnValue {
    title?: string;
    image?: string;
    onClick?: () => IPromise<void>;
}
const prRegex = new RegExp("^vstfs:///Git/PullRequestId/(.+)%2F(.+)%2F(.+)$");

function extractPrDetails(url: string): IPromise<GitPullRequest | void> {
    const match = url.match(prRegex);
    if (!match) {
        return Q();
    }
    const [, projectId, repositoryId, pullRequestIdStr] = match;
    const pullRequestId = Number(pullRequestIdStr);
    return getGitClient().getPullRequest(repositoryId, pullRequestId);
}

const actionProvider = {
    getValue: (wiData: { [id: number]: { [refName: string]: any } }) => {
        return getWitClient().getWorkItems(Object.keys(wiData).map(id => Number(id)), undefined, undefined, WorkItemExpand.Relations).then(wis => {
            const results: { [id: number]: IContributedQueryResultColumnValue } = {};
            return Q.all(wis.map(wi => {
                const allPullRequests = (wi.relations || [])
                    .filter(r => r.rel === "ArtifactLink" &&
                        r.url.match(prRegex)).map(({ url }) => extractPrDetails(url));
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
