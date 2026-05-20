import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { pb } from "../services/pocketbase";
import { CustomForm, FormSubmission } from "../lib/types";
import { ArrowLeft, Trash2, Mail, Check, Eye } from "lucide-react";

const AdminFormSubmissions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<CustomForm | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);

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
                <button
                  onClick={() => handleDelete(selectedSubmission.id)}
                  className="text-red-500 hover:text-red-700 bg-white border border-red-100 rounded-md p-1.5 shadow-sm transition-colors"
                  title="Usuń to zgłoszenie"
                >
                  <Trash2 size={16} />
                </button>
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
