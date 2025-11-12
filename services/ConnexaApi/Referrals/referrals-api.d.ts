import { Meta } from "../generic-response";

export interface GetReferralsResponse {
    data: {
        mine: ReferralResponse[];
        toMe: ReferralResponse[];
    }
    error: string;
    meta: {
        mine: Meta;
        toMe: Meta;
    }
}

export interface CreateReferralPayload {
    toMemberId: string;
    companyOrContact: string;
    description: string;
}

export interface ReferralResponse {
    id: string;
    fromMemberId: string;
    toMemberId: string;
    companyOrContact: string;
    description: string;
    status: ReferralStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface UpdateReferralStatusResponse {
    id: string;
    status: ReferralStatus;
}

export type ReferralStatus = 'NEW' | 'IN_CONTACT' | 'CLOSED' | 'DECLINED';