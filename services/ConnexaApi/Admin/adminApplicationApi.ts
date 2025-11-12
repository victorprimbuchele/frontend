import { apiBase } from "@/lib/api/client";
import { ApplicationResponse } from "../Application/application-api";
import { GenericListResponse, GenericResponse } from "../generic-response";
import { ApproveResponse, RejectResponse } from "./admin-applications-api";


async function getApplications(adminKey: string, page: number = 1, limit: number = 10): Promise<GenericListResponse<ApplicationResponse[]>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const response = await fetch(`${apiBase()}/admin/applications?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'X-ADMIN-KEY': adminKey },
    });
    return response.json();
}

async function rejectApplication(adminKey: string, id: string): Promise<GenericResponse<RejectResponse>> {
    const response = await fetch(`${apiBase()}/admin/applications/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-ADMIN-KEY': adminKey },
    });
    return response.json();
}

async function approveApplication(adminKey: string, id: string): Promise<GenericResponse<ApproveResponse>> {
    const response = await fetch(`${apiBase()}/admin/applications/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-ADMIN-KEY': adminKey },
    });
    return response.json();
}

export const adminApplicationApi = {
    getApplications,
    rejectApplication,
    approveApplication,
}