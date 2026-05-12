import { axiosInstance } from "./axiosInstance";
import axios from "axios";

export function authorization(token: string) {
    return axios.get("/bootstrap-api/tablecrm/bootstrap", {
        params: {
            token,
        },
    });
}

export function getClients(token: string) {
    return axiosInstance.get("/contragents", {
        params: {
            token
        },
    });
}

export function getClientsByPhone(token: string, phone: string) {
    return axiosInstance.get("/contragents", {
        params: {
            token,
            phone,
        },
    });
}

export function getWarehouses(token: string) {
    return axiosInstance.get("/warehouses", {
        params: { token },
    });
}

export function getPayboxes(token: string) {
    return axiosInstance.get("/payboxes", {
        params: { token },
    });
}

export function getOrganizations(token: string) {
    return axiosInstance.get("/organizations", {
        params: { token },
    });
}

export function getPriceTypes(token: string) {
    return axiosInstance.get("/price_types", {
        params: { token },
    });
}

export function getProducts(token: string, search?: string) {
    return axiosInstance.get("/nomenclature", {
        params: {
            token,
            search,
        },
    });
}

type CreateSalePayload = {
    organization: number;
    operation: string;
    contragent: number;
    warehouse: number;
    paybox: number;

    goods: {
        nomenclature: number;
        nomenclature_name: string;
        quantity: number;
        price: number;
        price_type: number;
    }[];
};

export const createSale = (
    token: string,
    conduct: boolean,
    payload: CreateSalePayload[]
) => {
    return axiosInstance.post("/docs_sales", payload, {
        params: {
            token,
            conduct,
        },
    });
};
