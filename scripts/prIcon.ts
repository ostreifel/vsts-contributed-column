import { GitPullRequest, PullRequestStatus } from "TFS/VersionControl/Contracts";

const currentFolder = window.location.href.match(/(.*\/).*?.html/)[1];

function urlOf(path: string): string {
    return currentFolder + path;
}

const abandoned: string = urlOf("img/abandoned.png");
const completed: string = urlOf("img/completed.png");
const rejected: string = urlOf("img/rejected.png");
const awaitingAuthor: string = urlOf("img/awaitingAuthor.png");
const approvedWithSuggestions: string = urlOf("img/approved.png");
const approved: string = urlOf("img/approved.png");
const awaitingApproval: string = urlOf("img/logo.png");

export function getPullRequestImage(pr: GitPullRequest): string {
    if (pr.status !== PullRequestStatus.Active) {
        if (pr.status === PullRequestStatus.Abandoned) {
            return abandoned;
        } else if (pr.status === PullRequestStatus.Completed) {
            return completed;
        }
        // TODO log;
        return "";
    }
    const reviewers = pr.reviewers;
    if ($.grep(reviewers, (reviewer) => reviewer.vote === -10).length > 0) {
        return rejected;
    } else if ($.grep(reviewers, (reviewer) => reviewer.vote === -5).length > 0) {
        return awaitingAuthor;
    } else if ($.grep(reviewers, (reviewer) => reviewer.vote === 5).length > 0) {
        return approvedWithSuggestions;
    } else if ($.grep(reviewers, (reviewer) => reviewer.vote === 10).length > 0) {
        return approved;
    } else {
        return awaitingApproval;
    }
}
