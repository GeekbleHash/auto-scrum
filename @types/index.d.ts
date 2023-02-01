declare namespace NodeJS {
    declare interface ProcessEnv {
        SLACK_ID: string;
        SLACK_SECRET: string;
        SERVER_URL: string;
        BOT_TOKEN: string;
    }
}

declare interface ICenter {
    name: string;
    channel: string;
}

declare interface ILog {
    client_msg_id: string
    type: string;
    text: string;
    user: string;
    ts: string;
    team: string;
}

declare interface IHistory {
    ok: boolean;
    messages: ILog[];
}

declare interface SlackElement {
    type: string;
    text?: string;
    style?: {
        bold?: boolean;
        strike?: boolean;
    } | string;
    elements?: SlackElement[];
}

declare interface Block {
    type: string;
    elements: SlackElement[];
}
