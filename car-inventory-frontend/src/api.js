const API_URL = "http://localhost:8080/api";

function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function clearToken() {
  localStorage.removeItem("token");
}

async function request(path, options = {}) {
  const headers = options.headers || {};
  if (getToken()) headers["Authorization"] = getToken();
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function register(username, password) {
  return request("/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function login(username, password) {
  const data = await request("/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setToken(data.token);
  return data;
}

export function logout() {
  clearToken();
}

export async function getVehicles() {
  return request("/vehicles");
}

export async function addVehicle(vehicle) {
  return request("/vehicles", {
    method: "POST",
    body: JSON.stringify(vehicle),
  });
}

export async function updateVehicle(id, vehicle) {
  return request(`/vehicles/${id}`, {
    method: "PUT",
    body: JSON.stringify(vehicle),
  });
}

export async function deleteVehicle(id) {
  return request(`/vehicles/${id}`, {
    method: "DELETE",
  });
}

export async function refreshMOT(registration, vehicleId) {
  return request("/mot", {
    method: "POST",
    body: JSON.stringify({ registration, vehicleId }),
  });
}

export function isLoggedIn() {
  return !!getToken();
} 