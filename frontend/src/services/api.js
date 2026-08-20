// Fleet360 - API Client Service with In-Memory JWT Storage

import {
  mockDashboardSummary,
  mockVehicles,
  mockRoutes,
  mockCustomers,
  mockDrivers,
  mockInsights,
  mockQuickBooksStatus
} from "./mockData";

class ApiService {
  constructor() {
    this.accessToken = null;
    this.baseUrl = "/api/v1";
    this.isStandaloneMock = true; // Set to true for self-contained operation
  }

  setToken(token) {
    this.accessToken = token;
  }

  getToken() {
    return this.accessToken;
  }

  clearToken() {
    this.accessToken = null;
  }

  async login(username, password) {
    if (this.isStandaloneMock) {
      this.accessToken = "mock_jwt_token_fleet360_" + Date.now();
      return {
        access_token: this.accessToken,
        token_type: "bearer",
        user: { name: "Operations Manager", role: "CFO / Fleet Controller", email: "manager@fleet360.io" }
      };
    }
    // Live FastAPI fetch integration point
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username, password })
    });
    if (!res.ok) throw new Error("Invalid credentials");
    const data = await res.json();
    this.accessToken = data.access_token;
    return data;
  }

  async getDashboardSummary() {
    if (this.isStandaloneMock) return mockDashboardSummary;
    return this._fetch("/dashboard/summary");
  }

  async getVehiclesRanking() {
    if (this.isStandaloneMock) return mockVehicles;
    return this._fetch("/vehicles/profitability/ranking");
  }

  async getVehicleDetail(id) {
    if (this.isStandaloneMock) {
      const v = mockVehicles.find((item) => item.id === id) || mockVehicles[0];
      return v;
    }
    return this._fetch(`/vehicles/${id}/profitability`);
  }

  async getRoutesRanking() {
    if (this.isStandaloneMock) return mockRoutes;
    return this._fetch("/routes/profitability/ranking");
  }

  async getRouteDetail(id) {
    if (this.isStandaloneMock) {
      const r = mockRoutes.find((item) => item.id === id) || mockRoutes[0];
      return r;
    }
    return this._fetch(`/routes/${id}/profitability`);
  }

  async getCustomersRanking() {
    if (this.isStandaloneMock) return mockCustomers;
    return this._fetch("/customers/profitability/ranking");
  }

  async getCustomerDetail(id) {
    if (this.isStandaloneMock) {
      const c = mockCustomers.find((item) => item.id === id) || mockCustomers[0];
      return c;
    }
    return this._fetch(`/customers/${id}/profitability`);
  }

  async getDriversScorecard() {
    if (this.isStandaloneMock) return mockDrivers;
    return this._fetch("/drivers/scorecard");
  }

  async getDriverDetail(id) {
    if (this.isStandaloneMock) {
      const d = mockDrivers.find((item) => item.id === id) || mockDrivers[0];
      return d;
    }
    return this._fetch(`/drivers/${id}/performance`);
  }

  async getInsights() {
    if (this.isStandaloneMock) return mockInsights;
    return this._fetch("/insights");
  }

  async getQuickBooksStatus() {
    if (this.isStandaloneMock) return mockQuickBooksStatus;
    return this._fetch("/quickbooks/status");
  }

  async _fetch(endpoint, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
      ...options.headers
    };
    const res = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers });
    if (!res.ok) throw new Error(`API error: ${res.statusText}`);
    return res.json();
  }
}

export const api = new ApiService();
