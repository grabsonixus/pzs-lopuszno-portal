import React, { useState, useEffect } from "react";
import { pb } from "../services/pocketbase";
import { CustomForm } from "../lib/types";

interface DynamicFormProps {
  formId?: string;
  formSlug?: string;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ formId, formSlug }) => {
  const [form, setForm] = useState<CustomForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  // Bot protection
  const [mathA, setMathA] = useState(0);
  const [mathB, setMathB] = useState(0);
  const [mathResult, setMathResult] = useState("");

  useEffect(() => {
    fetchForm();
    generateMath();
  }, [formId, formSlug]);

  const generateMath = () => {
    setMathA(Math.floor(Math.random() * 10) + 1);
    setMathB(Math.floor(Math.random() * 10) + 1);
    setMathResult("");
  };

  const fetchForm = async () => {
    setLoading(true);
    try {
      let record: CustomForm;
      if (formId) {
        record = await pb.collection("forms").getOne<CustomForm>(formId);
      } else if (formSlug) {
        const records = await pb.collection("forms").getList<CustomForm>(1, 1, {
          filter: `slug = "${formSlug}" && is_active = true`,
        });
        if (records.items.length === 0) throw new Error("Form not found");
        record = records.items[0];
      } else {
        throw new Error("No form ID or slug provided");
      }
      setForm(record);
    } catch (err) {
      console.error("Error fetching form:", err);
      setError("Nie udało się załadować formularza.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleCheckboxChange = (fieldId: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const current = Array.isArray(prev[fieldId]) ? prev[fieldId] : [];
      if (checked) {
        return { ...prev, [fieldId]: [...current, value] };
      } else {
        return { ...prev, [fieldId]: current.filter((v: string) => v !== value) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Validate bot protection
    if (parseInt(mathResult) !== mathA + mathB) {
      setError("Nieprawidłowy wynik działania matematycznego. Spróbuj ponownie.");
      generateMath();
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Zapis w bazie danych (panel administratora)
      await pb.collection("form_submissions").create({
        form_id: form.id,
        data: formData,
        is_read: false
      });

      // E-mail notifications are handled automatically by the PocketBase backend hook (pb_hooks/submissions.pb.js)

      setSuccess(true);
      setFormData({});
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Ładowanie formularza...</div>;
  if (!form || !form.is_active) return <div className="p-8 text-center text-red-500">Formularz jest niedostępny.</div>;

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 p-8 rounded-xl text-center shadow-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-2xl">✓</div>
        <h3 className="text-xl font-bold mb-2">Sukces!</h3>
        <p>{form.success_message || "Twoja wiadomość została wysłana."}</p>
        <button 
          onClick={() => { setSuccess(false); generateMath(); }} 
          className="mt-6 text-green-700 font-medium hover:underline"
        >
          Wyślij kolejną wiadomość
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">
      {form.title && <h2 className="text-2xl font-bold text-gray-800 mb-2">{form.title}</h2>}
      {form.description && <p className="text-gray-600 mb-6">{form.description}</p>}
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {form.fields && form.fields.map(field => (
          <div key={field.id}>
            {field.type !== 'static_text' ? (
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
            ) : (
              field.label && (
                <h4 className="text-base font-semibold text-gray-800 mb-2">
                  {field.label}
                </h4>
              )
            )}

            {field.type === 'static_text' && (
              <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed bg-gray-50/50 p-4 rounded-lg border border-gray-100/80">
                {field.placeholder}
              </div>
            )}

            {field.type === 'text' && (
              <input
                type="text"
                required={field.required}
                placeholder={field.placeholder}
                value={formData[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            )}

            {field.type === 'email' && (
              <input
                type="email"
                required={field.required}
                placeholder={field.placeholder}
                value={formData[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                required={field.required}
                placeholder={field.placeholder}
                value={formData[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                rows={4}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            )}

            {field.type === 'select' && (
              <select
                required={field.required}
                value={formData[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="" disabled>-- Wybierz --</option>
                {field.options?.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {field.type === 'radio' && (
              <div className="space-y-2">
                {field.options?.map((opt, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name={field.id}
                      required={field.required}
                      value={opt}
                      checked={formData[field.id] === opt}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {field.type === 'checkbox' && (
              <div className="space-y-2">
                {field.options?.map((opt, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      value={opt}
                      checked={Array.isArray(formData[field.id]) && formData[field.id].includes(opt)}
                      onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Bot protection / Captcha */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zabezpieczenie przed botami <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-800">{mathA} + {mathB} =</span>
              <input
                type="number"
                required
                value={mathResult}
                onChange={(e) => setMathResult(e.target.value)}
                className="w-24 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-center"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center"
        >
          {submitting ? (
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
          ) : null}
          {form.submit_button_text || "Wyślij"}
        </button>
      </form>
    </div>
  );
};

export default DynamicForm;
