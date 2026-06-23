import { Clipboard, Database, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchOptions, generateProductCode, type OptionGroups, type ProductCodeInput } from "./api";

const initialInput: ProductCodeInput = {
  aa: "1",
  bbb: "A01",
  cc: "E1",
  d: "M",
  eeee: "1",
  ff: "DM",
  gg: "01",
  hh: "01"
};

const fieldMeta: Array<{
  key: keyof ProductCodeInput;
  label: string;
  length: string;
  helper: string;
}> = [
  { key: "aa", label: "AA", length: "2 ky tu", helper: "Loai khuon, tu dong them 0 neu chi co 1 ky tu." },
  { key: "bbb", label: "BBB", length: "3 ky tu", helper: "Ma cot van gom 1 chu cai va 2 so." },
  { key: "cc", label: "CC", length: "2 ky tu", helper: "Tieu chuan Formaldehyde: E0, E1, E2." },
  { key: "d", label: "D", length: "1 ky tu", helper: "M: Melamine, L: Laminate, A: Acrylic." },
  { key: "eeee", label: "EEEE", length: "4 ky tu", helper: "Ma giay NCC, tu dong them 0 neu ngan hon 4 ky tu." },
  { key: "ff", label: "FF", length: "2 ky tu", helper: "Backer: BB, BG, BW, 00 hoac DM." },
  { key: "gg", label: "GG", length: "2 ky tu", helper: "Kich thuoc theo bang quy doi 03." },
  { key: "hh", label: "HH", length: "2 ky tu", helper: "Keo dan mat phu theo bang quy doi 04." }
];

function previewCode(input: ProductCodeInput) {
  return [
    "R",
    input.aa.toUpperCase().padStart(2, "0"),
    input.bbb.toUpperCase(),
    input.cc.toUpperCase(),
    input.d.toUpperCase(),
    input.eeee.toUpperCase().padStart(4, "0"),
    input.ff.toUpperCase(),
    input.gg.toUpperCase(),
    input.hh.toUpperCase()
  ].join("");
}

export function App() {
  const [form, setForm] = useState<ProductCodeInput>(initialInput);
  const [options, setOptions] = useState<OptionGroups | null>(null);
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("Dang tai danh muc...");

  const draftCode = useMemo(() => previewCode(form), [form]);

  useEffect(() => {
    fetchOptions()
      .then((data) => {
        setOptions(data);
        setStatus("Da ket noi backend.");
      })
      .catch((error: Error) => {
        setStatus(`Chua ket noi duoc API: ${error.message}`);
      });
  }, []);

  async function handleGenerate() {
    setStatus("Dang sinh ma...");
    try {
      const data = await generateProductCode(form);
      setResult(data.code);
      setStatus("Da sinh ma thanh cong.");
    } catch (error) {
      setResult("");
      setStatus(error instanceof Error ? error.message : "Khong the sinh ma.");
    }
  }

  async function copyCode() {
    const code = result || draftCode;
    await navigator.clipboard.writeText(code);
    setStatus("Da copy ma vao clipboard.");
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="topbar">
          <div>
            <p className="eyebrow">Wood Product Generator</p>
            <h1>Sinh ma hang tu dong</h1>
          </div>
          <div className="status">
            <Database size={18} aria-hidden="true" />
            <span>{status}</span>
          </div>
        </div>

        <div className="generator-layout">
          <form className="panel form-panel" onSubmit={(event) => event.preventDefault()}>
            {fieldMeta.map((field) => {
              const group = options?.[field.key] ?? [];

              return (
                <label className="field" key={field.key}>
                  <span className="field-heading">
                    <span>{field.label}</span>
                    <small>{field.length}</small>
                  </span>
                  {group.length > 0 ? (
                    <select
                      value={form[field.key]}
                      onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                    >
                      {group.map((option) => (
                        <option value={option.code} key={option.code}>
                          {option.code} - {option.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={form[field.key]}
                      onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                      spellCheck={false}
                    />
                  )}
                  <span className="helper">{field.helper}</span>
                </label>
              );
            })}
          </form>

          <aside className="panel result-panel">
            <div>
              <p className="eyebrow">Preview</p>
              <div className="code-output">{result || draftCode}</div>
            </div>

            <div className="segment-grid">
              {fieldMeta.map((field) => (
                <div className="segment" key={field.key}>
                  <span>{field.label}</span>
                  <strong>{form[field.key] || "--"}</strong>
                </div>
              ))}
            </div>

            <div className="actions">
              <button type="button" className="primary-button" onClick={handleGenerate}>
                <RefreshCw size={18} aria-hidden="true" />
                Sinh ma
              </button>
              <button type="button" className="icon-button" onClick={copyCode} title="Copy ma">
                <Clipboard size={19} aria-hidden="true" />
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
