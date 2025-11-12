import { apiBase } from "@/lib/api/client";
import { CreateReferralPayload, GetReferralsResponse, ReferralResponse, ReferralStatus, UpdateReferralStatusResponse } from "./referrals-api";
import { GenericResponse } from "../generic-response";

async function getReferrals(memberId: string, page: number = 1, limit: number = 10, type?: 'mine' | 'toMe'): Promise<GetReferralsResponse> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (type) {
        params.append('type', type);
    }
    const response = await fetch(`${apiBase()}/referrals?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'X-MEMBER-ID': memberId },
    });
    return response.json();
}

async function createReferral(memberId: string, input: CreateReferralPayload): Promise<GenericResponse<ReferralResponse>> {
    const response = await fetch(`${apiBase()}/referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-MEMBER-ID': memberId },
        body: JSON.stringify(input),
    });
    return response.json();
}

async function updateReferralStatus(memberId: string, id: string, status: ReferralStatus): Promise<GenericResponse<UpdateReferralStatusResponse>> {
    const response = await fetch(`${apiBase()}/referrals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-MEMBER-ID': memberId },
        body: JSON.stringify({ status }),
    });
    return response.json();
}

export const referralsApi = {
    getReferrals,
    createReferral,
    updateReferralStatus
}