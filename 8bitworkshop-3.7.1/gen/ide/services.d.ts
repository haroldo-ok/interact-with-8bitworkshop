import { FileData } from "../common/workertypes";
import { CodeProject } from "./project";
export interface GHRepoMetadata {
    url: string;
    platform_id: string;
    sha?: string;
    mainPath?: string;
    branch?: string;
}
export interface GHSession extends GHRepoMetadata {
    user: string;
    reponame: string;
    repopath: string;
    subtreepath: string;
    prefix: string;
    repo: any;
    tree?: any;
    head?: any;
    commit?: any;
    paths?: string[];
}
export declare function getRepos(): {
    [key: string]: GHRepoMetadata;
};
export declare function parseGithubURL(ghurl: string): {
    user: string;
    repo: string;
    repopath: string;
    branch: string;
    subtreepath: string;
};
export declare class GithubService {
    githubCons: any;
    githubToken: any;
    github: any;
    store: any;
    project: CodeProject;
    constructor(githubCons: () => any, githubToken: string, store: any, project: CodeProject);
    recreateGithub(): void;
    login(): Promise<void>;
    logout(): Promise<void>;
    isFileIgnored(s: string): boolean;
    getGithubSession(ghurl: string): Promise<GHSession>;
    getGithubHEADTree(ghurl: string): Promise<GHSession>;
    bind(sess: GHSession, dobind: boolean): void;
    import(ghurl: string): Promise<GHSession>;
    pull(ghurl: string, deststore?: any): Promise<GHSession>;
    importAndPull(ghurl: string): Promise<GHSession>;
    publish(reponame: string, desc: string, license: string, isprivate: boolean): Promise<GHSession>;
    commit(ghurl: string, message: string, files: {
        path: string;
        data: FileData;
    }[]): Promise<GHSession>;
    push(sess: GHSession): Promise<GHSession>;
    deleteRepository(ghurl: string): Promise<any>;
}
