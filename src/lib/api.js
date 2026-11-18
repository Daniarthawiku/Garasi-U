const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:4000";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const VEHICLE_STATUS_MAP = {
  NOT_SYNC: { label: "Not Sync", variant: "neutral" },
  HEALTHY: { label: "Healthy", variant: "success" },
  SERVICE_SOON: { label: "Service Soon", variant: "warning" },
  NEED_MAINTENANCE: { label: "Need Maintenance", variant: "danger" },
};

const SERVICE_CATEGORY_TO_UI = {
  ROUTINE_MAINTENANCE: "Routine Maintenance",
  UNSCHEDULED_REPAIR: "Unscheduled Repair",
};

const SERVICE_CATEGORY_TO_API = {
  "Routine Maintenance": "ROUTINE_MAINTENANCE",
  "Unscheduled Repair": "UNSCHEDULED_REPAIR",
};

const SERVICE_STATUS_TO_UI = {
  VERIFIED: "Verified",
  COMPLETED: "Completed",
};

export function formatIsoDateDisplay(isoString) {
  if (!isoString) return "";
  const datePart = String(isoString).slice(0, 10);
  const parts = datePart.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    const monthName = MONTHS[parseInt(month, 10) - 1];
    if (monthName) return `${day} ${monthName} ${year}`;
  }
  return datePart;
}

export function mapBackendVehicle(vehicle) {
  const statusObj =
    VEHICLE_STATUS_MAP[vehicle.serviceStatus] || VEHICLE_STATUS_MAP.NOT_SYNC;
  const typeLabel = vehicle.type === "MOTORCYCLE" ? "Motorcycle" : "Car";

  const mappedParts = (vehicle.parts || []).map((part) => {
    const dueOdo = (part.lastServiceOdo || 0) + (part.intervalKm || 0);
    const overKm =
      part.wear > 100 && vehicle.currentOdometer > dueOdo
        ? vehicle.currentOdometer - dueOdo
        : undefined;

    return {
      id: part.id,
      name: part.name,
      wear: part.wear ?? 0,
      overKm,
      intervalKm: part.intervalKm,
      lastServiceOdo: part.lastServiceOdo,
      lastServiceDate: part.lastServiceDate,
    };
  });

  return {
    id: vehicle.id,
    brand: vehicle.brand,
    model: vehicle.model,
    name: `${vehicle.brand} ${vehicle.model}`.trim(),
    nickname: vehicle.nickname,
    type: typeLabel,
    category: typeLabel,
    year: vehicle.year,
    plate: vehicle.plate,
    tankCapacity: vehicle.tankCapacity,
    initialOdometer: vehicle.initialOdometer,
    odometer: vehicle.currentOdometer,
    isActive: vehicle.isActive,
    lastService: vehicle.lastServiceDate
      ? formatIsoDateDisplay(vehicle.lastServiceDate)
      : null,
    serviceStatus: statusObj.label,
    status: statusObj,
    parts: mappedParts,
    fuelEfficiency: null,
    costPerKm: null,
    engine: vehicle.nickname
      ? `${vehicle.nickname}${vehicle.plate ? ` • ${vehicle.plate}` : ""}`
      : vehicle.plate || null,
  };
}

export function mapBackendServiceLog(log) {
  const isoDate = log.serviceDate ? String(log.serviceDate).slice(0, 10) : "";
  return {
    id: log.id,
    vehicleId: log.vehicleId,
    vehiclePartId: log.vehiclePartId,
    rawDate: isoDate,
    date: formatIsoDateDisplay(isoDate),
    odo: log.odometerAtService,
    category: SERVICE_CATEGORY_TO_UI[log.category] || log.category,
    status: SERVICE_STATUS_TO_UI[log.status] || log.status,
    part: log.part,
    workshop: log.workshop,
    cost: Number(log.cost) || 0,
    isWarrantyClaim: Boolean(log.isWarrantyClaim),
    notes: log.notes || "",
  };
}

export function toCreateVehiclePayload(formData) {
  const payload = {
    brand: String(formData.brand || "").trim(),
    model: String(formData.model || "").trim(),
    type: formData.type === "Motorcycle" ? "MOTORCYCLE" : "CAR",
    initialOdometer: Number(formData.odometer) || 0,
  };

  if (formData.nickname && String(formData.nickname).trim()) {
    payload.nickname = String(formData.nickname).trim();
  }
  if (formData.year !== null && formData.year !== undefined && formData.year !== "") {
    payload.year = Number(formData.year);
  }
  if (formData.plate && String(formData.plate).trim()) {
    payload.plate = String(formData.plate).trim();
  }
  if (
    formData.tankCapacity !== null &&
    formData.tankCapacity !== undefined &&
    formData.tankCapacity !== ""
  ) {
    payload.tankCapacity = Number(formData.tankCapacity);
  }

  return payload;
}

export function toUpdateVehiclePayload(formData) {
  const payload = {
    brand: String(formData.brand || "").trim(),
    model: String(formData.model || "").trim(),
    type: formData.type === "Motorcycle" ? "MOTORCYCLE" : "CAR",
    currentOdometer: Number(formData.odometer) || 0,
  };

  if (formData.nickname !== undefined && formData.nickname !== null) {
    const trimmed = String(formData.nickname).trim();
    if (trimmed) payload.nickname = trimmed;
  }
  if (formData.year !== null && formData.year !== undefined && formData.year !== "") {
    payload.year = Number(formData.year);
  }
  if (formData.plate !== undefined && formData.plate !== null) {
    const trimmed = String(formData.plate).trim();
    if (trimmed) payload.plate = trimmed;
  }
  if (
    formData.tankCapacity !== null &&
    formData.tankCapacity !== undefined &&
    formData.tankCapacity !== ""
  ) {
    payload.tankCapacity = Number(formData.tankCapacity);
  }

  return payload;
}

export function toServiceLogPayload(formData, vehicleId) {
  const payload = {
    serviceDate: formData.rawDate || formData.date,
    odometerAtService: Number(formData.odo) || 0,
    category:
      SERVICE_CATEGORY_TO_API[formData.category] || "ROUTINE_MAINTENANCE",
    part: String(formData.part || "").trim(),
    workshop: String(formData.workshop || "").trim(),
    cost: Number(formData.cost) || 0,
  };

  if (vehicleId) {
    payload.vehicleId = vehicleId;
  }

  return payload;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export const vehiclesApi = {
  async getAll() {
    const data = await request("/vehicles");
    return Array.isArray(data) ? data.map(mapBackendVehicle) : [];
  },
  async getOne(id) {
    const data = await request(`/vehicles/${id}`);
    return mapBackendVehicle(data);
  },
  async create(formData) {
    const payload = toCreateVehiclePayload(formData);
    const data = await request("/vehicles", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return mapBackendVehicle(data);
  },
  async update(id, formData) {
    const payload = toUpdateVehiclePayload(formData);
    const data = await request(`/vehicles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return mapBackendVehicle(data);
  },
  async remove(id) {
    return request(`/vehicles/${id}`, {
      method: "DELETE",
    });
  },
};

export const serviceLogsApi = {
  async getAll(vehicleId) {
    const query = vehicleId
      ? `?vehicleId=${encodeURIComponent(vehicleId)}`
      : "";
    const data = await request(`/service-logs${query}`);
    return Array.isArray(data) ? data.map(mapBackendServiceLog) : [];
  },
  async create(vehicleId, formData) {
    const payload = toServiceLogPayload(formData, vehicleId);
    const data = await request("/service-logs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return mapBackendServiceLog(data);
  },
  async update(id, formData) {
    const payload = toServiceLogPayload(formData);
    const data = await request(`/service-logs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return mapBackendServiceLog(data);
  },
  async remove(id) {
    return request(`/service-logs/${id}`, {
      method: "DELETE",
    });
  },
};
