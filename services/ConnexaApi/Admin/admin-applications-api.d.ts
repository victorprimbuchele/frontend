export interface RejectResponse {
    message: string;
}

export interface ApproveResponse {
    message: string;
    invite: {
        inviteUrl: string;
        token: string;
    };
}