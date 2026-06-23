export type OptionRow = {
  code: string;
  name: string;
  description: string | null;
  materialCode?: string;
};

export type OptionGroups = {
  aa: OptionRow[];
  bbb: OptionRow[];
  cc: OptionRow[];
  d: OptionRow[];
  eeee: OptionRow[];
  ff: OptionRow[];
  gg: OptionRow[];
  hh: OptionRow[];
};

export type ProductCodeInput = Record<keyof OptionGroups, string>;

export type ProductCodeResult = {
  code: string;
  segments: ProductCodeInput;
};

export type ProductCodeSearchItem = {
  index: number;
  code: string;
  name: string;
  imageUrl: string;
};

export type ProductCodeSearchResult = {
  items: ProductCodeSearchItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    },
    ...init
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchOptions() {
  return request<OptionGroups>("/api/options");
}

export function generateProductCode(input: ProductCodeInput) {
  return request<ProductCodeResult>("/api/product-codes/generate", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function searchProductCodes(input: ProductCodeInput, page = 1, pageSize = 50) {
  return request<ProductCodeSearchResult>("/api/product-codes/search", {
    method: "POST",
    body: JSON.stringify({ ...input, page, pageSize })
  });
}
