import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import {
  fetchOptions,
  searchProductCodes,
  type OptionGroups,
  type ProductCodeInput,
  type ProductCodeSearchItem
} from "./api";
import ritaWoodLogo from "./assets/rita-wood-logo.png";
import { defaultOptions } from "./defaultOptions";

const initialInput: ProductCodeInput = {
  aa: "",
  bbb: "",
  cc: "",
  d: "",
  eeee: "",
  ff: "",
  gg: "",
  hh: ""
};

const pageSize = 50;

const fieldMeta: Array<{
  key: keyof ProductCodeInput;
  label: string;
  length: string;
}> = [
  { key: "aa", label: "Loại khuôn", length: "AA - 2 ký tự" },
  { key: "bbb", label: "Mã cốt ván", length: "BBB - 3 ký tự" },
  { key: "cc", label: "Tiêu chuẩn phát thải", length: "CC - 2 ký tự" },
  { key: "d", label: "Chất liệu mặt phủ", length: "D - 1 ký tự" },
  { key: "eeee", label: "Mã giấy NCC", length: "EEEE - 4 ký tự" },
  { key: "ff", label: "Chất liệu mặt phủ sau", length: "FF - 2 ký tự" },
  { key: "gg", label: "Kích thước", length: "GG - 2 ký tự" },
  { key: "hh", label: "Keo dán mặt phủ", length: "HH - 2 ký tự" }
];

export function App() {
  const [form, setForm] = useState<ProductCodeInput>(initialInput);
  const [options, setOptions] = useState<OptionGroups | null>(null);
  const [items, setItems] = useState<ProductCodeSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchOptions()
      .then((data) => {
        setOptions(data);
      })
      .catch((error: Error) => {
        console.warn(error);
        setOptions(defaultOptions);
      });
  }, []);

  async function handleSearch(nextPage = 1) {
    if (isSearching) {
      return;
    }

    setIsSearching(true);

    try {
      const data = await searchProductCodes(form, nextPage, pageSize);
      setItems(data.items);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotalItems(data.total);
    } catch (error) {
      setItems([]);
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <main className="app-shell">
      <section>
        <div className="brand-heading">
          <div>
            <p className="eyebrow">Wood Product Generator</p>
            <h1>Tìm mã sản phẩm</h1>
          </div>
          <img className="site-logo" src={ritaWoodLogo} alt="Rita Võ Wood" />
        </div>

        <div className="generator-layout">
          <form className="panel form-panel" onSubmit={(event) => event.preventDefault()}>
            {fieldMeta.map((field) => {
              const group =
                field.key === "eeee" && form.d
                  ? (options?.eeee ?? []).filter((option) => option.materialCode === form.d)
                  : options?.[field.key] ?? [];

              return (
                <label className="field" key={field.key}>
                  <span className="field-heading">
                    <span>{field.label}</span>
                    <small>{field.length}</small>
                  </span>
                  <select
                    value={form[field.key]}
                    disabled={field.key === "eeee" && (options?.eeee.length ?? 0) === 0}
                    onChange={(event) =>
                      {
                        setForm((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                          ...(field.key === "d" ? { eeee: "" } : {})
                        }));
                        setItems([]);
                        setPage(1);
                        setTotalPages(0);
                        setTotalItems(0);
                      }
                    }
                  >
                    <option value="">
                      {field.key === "eeee" && group.length === 0 ? "Chưa có dữ liệu EEEE" : "Tất cả"}
                    </option>
                    {group.map((option) => (
                      <option value={option.code} key={option.code}>
                        {option.code} - {option.name}
                        {option.description ? ` (${option.description})` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })}
          </form>

          <aside className="panel result-panel">
            <div className="segment-grid">
              {fieldMeta.map((field) => (
                <div className="segment" key={field.key}>
                  <span>{field.label}</span>
                  <strong>{form[field.key] || "Tất cả"}</strong>
                </div>
              ))}
            </div>

            <div className="actions">
              <button type="button" className="primary-button" onClick={() => handleSearch(1)} disabled={isSearching}>
                <Search size={18} aria-hidden="true" />
                {isSearching ? "Đang tìm..." : "Tìm mã sản phẩm"}
              </button>
            </div>

            <div className="results">
              <p className="eyebrow">Kết quả</p>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Mã sản phẩm</th>
                      <th>Tên sản phẩm</th>
                      <th>Hình ảnh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length > 0 ? (
                      items.map((item) => (
                        <tr key={`${item.index}-${item.code}`}>
                          <td>{item.index}</td>
                          <td className="product-code">{item.code}</td>
                          <td>{item.name}</td>
                          <td>
                            <img src={item.imageUrl} alt={item.name} loading="lazy" />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="empty-state">
                          Chưa có kết quả.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="pagination-bar">
                <span>
                  {totalItems > 0
                    ? `Trang ${page}/${totalPages} - ${totalItems} sản phẩm`
                    : "0 sản phẩm"}
                </span>
                <div className="pagination-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleSearch(page - 1)}
                    disabled={isSearching || page <= 1}
                  >
                    Trước
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleSearch(page + 1)}
                    disabled={isSearching || totalPages === 0 || page >= totalPages}
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
