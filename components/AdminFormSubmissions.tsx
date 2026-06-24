import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { pb } from "../services/pocketbase";
import { CustomForm, FormSubmission, SiteSettings } from "../lib/types";
import { ArrowLeft, Trash2, Mail, Check, Eye, Printer } from "lucide-react";

const AdminFormSubmissions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<CustomForm | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  const handlePrint = () => {
    if (!selectedSubmission || !form) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Proszę zezwolić na otwieranie wyskakujących okienek (pop-upów) w przeglądarce.");
      return;
    }

    const schoolName = siteSettings
      ? `${siteSettings.navbar_title} ${siteSettings.navbar_subtitle}`.trim()
      : "Powiatowy Zespół Szkół w Łopusznie";

    const printDate = new Date().toLocaleString("pl-PL");
    const submissionDate = new Date(selectedSubmission.created).toLocaleString("pl-PL");

    // Zbierz pytania i odpowiedzi
    const elementsHtml: string[] = [];
    const renderedKeys = new Set<string>();

    // 1. Wyświetl najpierw zdefiniowane pola z formularza w odpowiedniej kolejności
    form.fields?.forEach(field => {
      if (field.type === "static_text") return;
      const key = field.id;
      const value = selectedSubmission.data[key];
      if (value !== undefined) {
        renderedKeys.add(key);
        elementsHtml.push(`
          <div class="field-block">
            <div class="field-label">${field.label || key}</div>
            <div class="field-value">${Array.isArray(value) ? value.join(", ") : String(value || "-")}</div>
          </div>
        `);
      }
    });

    // 2. Wyświetl pozostałe dane
    Object.entries(selectedSubmission.data).forEach(([key, value]) => {
      if (!renderedKeys.has(key)) {
        elementsHtml.push(`
          <div class="field-block">
            <div class="field-label">${key}</div>
            <div class="field-value">${Array.isArray(value) ? value.join(", ") : String(value || "-")}</div>
          </div>
        `);
      }
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pl">
      <head>
        <meta charset="UTF-8">
        <title>Zgłoszenie - ${form.title}</title>
        <style>
          body {
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
            color: #1a202c;
            line-height: 1.3;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            font-size: 13px;
          }
          .header {
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 8px;
            margin-bottom: 15px;
          }
          .school-name {
            font-size: 13px;
            font-weight: bold;
            color: #4b5563;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
          }
          .form-title {
            font-size: 20px;
            font-weight: bold;
            color: #1e3a8a;
            margin: 0 0 8px 0;
          }
          .metadata-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            font-size: 11px;
            color: #4b5563;
            background-color: #f3f4f6;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
          }
          .metadata-item span {
            font-weight: 600;
            color: #1f2937;
          }
          .content-title {
            font-size: 15px;
            font-weight: bold;
            color: #1f2937;
            margin-top: 15px;
            margin-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
          }
          .field-block {
            margin-bottom: 10px;
            page-break-inside: avoid;
          }
          .field-label {
            font-size: 12px;
            font-weight: bold;
            color: #4b5563;
            margin-bottom: 2px;
          }
          .field-value {
            font-size: 13px;
            color: #111827;
            background-color: #fff;
            border: 1px solid #e5e7eb;
            padding: 6px 10px;
            border-radius: 6px;
            white-space: pre-wrap;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            padding-top: 8px;
          }
          @media print {
            body {
              padding: 0;
              font-size: 12px;
            }
            .header {
              margin-bottom: 10px;
              padding-bottom: 6px;
            }
            .form-title {
              font-size: 18px;
              margin-bottom: 5px;
            }
            .metadata-grid {
              padding: 6px 10px;
              font-size: 10px;
            }
            .content-title {
              margin-top: 10px;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .field-block {
              margin-bottom: 8px;
            }
            .field-label {
              font-size: 11px;
              margin-bottom: 1px;
            }
            .field-value {
              font-size: 12px;
              padding: 4px 8px;
            }
            .footer {
              margin-top: 15px;
              padding-top: 6px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="school-name">${schoolName}</div>
          <h1 class="form-title">${form.title}</h1>
          <div class="metadata-grid">
            <div class="metadata-item"><span>Data wysłania:</span> ${submissionDate}</div>
            <div class="metadata-item" style="text-align: right;"><span>Data wydruku:</span> ${printDate}</div>
          </div>
        </div>

        <div class="content-title">Odpowiedzi formularza</div>

        <div class="fields-container">
          ${elementsHtml.join("")}
        </div>

        <div class="footer">
          Generowane automatycznie z portalu szkoły
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const formRecord = await pb.collection("forms").getOne<CustomForm>(id!);
      setForm(formRecord);

      const submissionsRecords = await pb.collection("form_submissions").getFullList<FormSubmission>({
        filter: `form_id = "${id}"`,
        sort: "-created",
      });
      setSubmissions(submissionsRecords);

      // Pobierz site_settings dla nazwy szkoły
      try {
        const settingsList = await pb.collection("site_settings").getList<SiteSettings>(1, 1);
        if (settingsList.items.length > 0) {
          setSiteSettings(settingsList.items[0]);
        }
      } catch (err) {
        console.error("Error fetching site settings:", err);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (submissionId: string) => {
    try {
      await pb.collection("form_submissions").update(submissionId, { is_read: true });
      setSubmissions(prev => 
        prev.map(s => s.id === submissionId ? { ...s, is_read: true } : s)
      );
      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(prev => prev ? { ...prev, is_read: true } : null);
      }
    } catch (error) {
      console.error("Error updating submission:", error);
    }
  };

  const handleDelete = async (submissionId: string) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę odpowiedź?")) {
      try {
        await pb.collection("form_submissions").delete(submissionId);
        setSubmissions(prev => prev.filter(s => s.id !== submissionId));
        if (selectedSubmission?.id === submissionId) {
          setSelectedSubmission(null);
        }
      } catch (error) {
        console.error("Error deleting submission:", error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pl-PL");
  };

  const renderDataPreview = (data: Record<string, any>) => {
    if (!form || !form.fields) return "-";
    // Find the first non-static-text field defined in form fields that exists in data
    const firstField = form.fields.find(f => f.type !== "static_text" && data[f.id] !== undefined);
    if (firstField) {
      const preview = data[firstField.id];
      return String(preview).substring(0, 30) + (String(preview).length > 30 ? "..." : "");
    }
    const keys = Object.keys(data);
    if (keys.length === 0) return "-";
    const preview = data[keys[0]];
    return String(preview).substring(0, 30) + (String(preview).length > 30 ? "..." : "");
  };

  if (loading) return <div className="p-8 text-center">Ładowanie odpowiedzi...</div>;
  if (!form) return <div className="p-8 text-center text-red-500">Nie znaleziono formularza.</div>;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/forms" className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Odpowiedzi</h1>
          <p className="text-gray-500 mt-1">Formularz: {form.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[600px] flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-700">Wszystkie zgłoszenia ({submissions.length})</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {submissions.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">Brak odpowiedzi.</div>
            ) : (
              submissions.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubmission(sub);
                    if (!sub.is_read) markAsRead(sub.id);
                  }}
                  className={`w-full text-left p-3 mb-2 rounded-lg border transition-all ${selectedSubmission?.id === sub.id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-50'} flex gap-3`}
                >
                  <div className={`mt-1 flex-shrink-0 ${sub.is_read ? 'text-gray-300' : 'text-blue-500'}`}>
                    {sub.is_read ? <Mail size={16} /> : <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm truncate ${sub.is_read ? 'font-medium text-gray-600' : 'font-bold text-gray-900'}`}>
                      {renderDataPreview(sub.data)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(sub.created)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedSubmission ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail size={16} />
                  Zgłoszenie z dnia: {formatDate(selectedSubmission.created)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-100 rounded-md py-1.5 px-3 shadow-sm transition-colors flex items-center gap-1.5 text-xs font-semibold hover:bg-indigo-50"
                    title="Drukuj to zgłoszenie"
                  >
                    <Printer size={15} />
                    Drukuj
                  </button>
                  <button
                    onClick={() => handleDelete(selectedSubmission.id)}
                    className="text-red-500 hover:text-red-700 bg-white border border-red-100 rounded-md p-1.5 shadow-sm transition-colors hover:bg-red-50"
                    title="Usuń to zgłoszenie"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {(() => {
                    const renderedKeys = new Set<string>();
                    const elements: React.ReactNode[] = [];

                    // Render fields defined in the form config first (in correct order)
                    form.fields?.forEach(field => {
                      if (field.type === "static_text") return;
                      const key = field.id;
                      const value = selectedSubmission.data[key];
                      if (value !== undefined) {
                        renderedKeys.add(key);
                        elements.push(
                          <div key={key} className="border-b border-gray-50 pb-4 last:border-0">
                            <h4 className="text-sm font-semibold text-gray-500 mb-1">{field.label || key}</h4>
                            <div className="text-gray-900 bg-gray-50/50 p-3 rounded-lg text-sm whitespace-pre-wrap">
                              {Array.isArray(value) ? value.join(", ") : String(value || "-")}
                            </div>
                          </div>
                        );
                      }
                    });

                    // Render any remaining keys in data that were not in form.fields (e.g. metadata)
                    Object.entries(selectedSubmission.data).forEach(([key, value]) => {
                      if (!renderedKeys.has(key)) {
                        elements.push(
                          <div key={key} className="border-b border-gray-50 pb-4 last:border-0">
                            <h4 className="text-sm font-semibold text-gray-500 mb-1">{key}</h4>
                            <div className="text-gray-900 bg-gray-50/50 p-3 rounded-lg text-sm whitespace-pre-wrap">
                              {Array.isArray(value) ? value.join(", ") : String(value || "-")}
                            </div>
                          </div>
                        );
                      }
                    });

                    return elements;
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[600px] bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-gray-400">
              <Eye size={48} className="mb-4 text-gray-300" />
              <p>Wybierz zgłoszenie z listy po lewej, aby zobaczyć szczegóły.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFormSubmissions;
