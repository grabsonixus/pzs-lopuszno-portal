import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { pb } from "../services/pocketbase";
import { CustomForm, FormField, FormFieldType } from "../lib/types";
import { generateBaseSlug } from "../lib/slugUtils";
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Settings, Copy, Check, Send, ExternalLink } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableField: React.FC<{ 
  field: FormField, 
  index: number, 
  updateField: (index: number, data: Partial<FormField>) => void,
  removeField: (index: number) => void 
}> = ({ field, index, updateField, removeField }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm group">
      <div className="flex items-start gap-4">
        <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
          <GripVertical size={20} />
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Etykieta pola</label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateField(index, { label: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="np. Imię i nazwisko"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Typ pola</label>
            <select
              value={field.type}
              onChange={(e) => updateField(index, { type: e.target.value as FormFieldType })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="text">Krótki tekst</option>
              <option value="email">Adres E-mail</option>
              <option value="textarea">Dłuższy tekst</option>
              <option value="select">Lista rozwijana</option>
              <option value="radio">Jednokrotny wybór</option>
              <option value="checkbox">Wielokrotny wybór / Zgoda</option>
              <option value="static_text">Tekst statyczny (np. pouczenie RODO / nagłówek)</option>
            </select>
          </div>
          
          {['text', 'email', 'textarea', 'static_text'].includes(field.type) && (
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {field.type === 'static_text' ? 'Treść tekstu statycznego' : 'Tekst zastępczy (Placeholder)'}
              </label>
              {field.type === 'static_text' ? (
                <textarea
                  value={field.placeholder || ''}
                  onChange={(e) => updateField(index, { placeholder: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  rows={4}
                  placeholder="Tutaj wpisz treść dłuższego tekstu statycznego..."
                />
              ) : (
                <input
                  type="text"
                  value={field.placeholder || ''}
                  onChange={(e) => updateField(index, { placeholder: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Widoczny wewnątrz pustego pola"
                />
              )}
            </div>
          )}

          {['select', 'radio', 'checkbox'].includes(field.type) && (
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Opcje (oddzielone przecinkami)</label>
              <input
                type="text"
                value={field.options?.join(', ') || ''}
                onChange={(e) => updateField(index, { options: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Opcja 1, Opcja 2, Opcja 3"
              />
            </div>
          )}
          
          <div className="md:col-span-2 flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            {field.type !== 'static_text' ? (
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(index, { required: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Pole wymagane
              </label>
            ) : (
              <div />
            )}
            <button onClick={() => removeField(index)} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 transition-colors">
              <Trash2 size={16} /> Usuń pole
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminFormEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<Partial<CustomForm>>({
    title: "",
    slug: "",
    description: "",
    target_email: "",
    submit_button_text: "Wyślij",
    success_message: "Dziękujemy. Twoja wiadomość została wysłana.",
    fields: [],
    is_active: true,
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const copyFormLink = () => {
    if (!form.slug) return;
    const link = `${window.location.origin}/formularz/${form.slug}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy:", err);
      alert("Nie udało się skopiować linku: " + link);
    });
  };

  const sendTestSubmission = async () => {
    if (!isEdit || !form.id) return;
    
    setSendingTest(true);
    try {
      const testData: Record<string, any> = {};
      if (form.fields) {
        form.fields.forEach(field => {
          if (field.type === 'static_text') return;
          
          if (field.type === 'checkbox' || field.type === 'select' || field.type === 'radio') {
            const opt = field.options && field.options.length > 0 ? field.options[0] : "Testowa opcja";
            testData[field.id] = field.type === 'checkbox' ? [opt] : opt;
          } else if (field.type === 'email') {
            testData[field.id] = "test@example.com";
          } else {
            testData[field.id] = `Testowa wartość dla "${field.label}"`;
          }
        });
      }
      
      await pb.collection("form_submissions").create({
        form_id: form.id,
        data: {
          ...testData,
          is_test_submission: "TAK - TEST POWIADOMIENIA E-MAIL"
        },
        is_read: true
      });
      
      alert("Testowe zgłoszenie zostało wysłane! Sprawdź skrzynkę odbiorczą (e-mail docelowy: " + (form.target_email || "") + ").");
    } catch (error: any) {
      console.error("Error sending test submission:", error);
      alert("Nie udało się wysłać testowego zgłoszenia: " + (error.message || error));
    } finally {
      setSendingTest(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (isEdit) {
      fetchForm();
    }
  }, [id]);

  const fetchForm = async () => {
    try {
      const record = await pb.collection("forms").getOne<CustomForm>(id!);
      setForm(record);
    } catch (error) {
      console.error("Error fetching form:", error);
      alert("Nie udało się załadować formularza.");
      navigate("/admin/forms");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setForm((prev) => {
        const oldIndex = prev.fields!.findIndex(f => f.id === active.id);
        const newIndex = prev.fields!.findIndex(f => f.id === over.id);
        return { ...prev, fields: arrayMove(prev.fields!, oldIndex, newIndex) };
      });
    }
  };

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "text",
      label: "Nowe pole",
      required: false,
    };
    setForm(prev => ({ ...prev, fields: [...(prev.fields || []), newField] }));
  };

  const updateField = (index: number, data: Partial<FormField>) => {
    setForm(prev => {
      const newFields = [...(prev.fields || [])];
      newFields[index] = { ...newFields[index], ...data };
      return { ...prev, fields: newFields };
    });
  };

  const removeField = (index: number) => {
    setForm(prev => {
      const newFields = [...(prev.fields || [])];
      newFields.splice(index, 1);
      return { ...prev, fields: newFields };
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm(prev => ({ ...prev, title, slug: !isEdit ? generateBaseSlug(title) : prev.slug }));
  };

  const saveForm = async () => {
    if (!form.title || !form.slug || !form.target_email) {
      alert("Tytuł, slug i e-mail docelowy są wymagane.");
      return;
    }
    
    setSaving(true);
    try {
      if (isEdit) {
        await pb.collection("forms").update(id!, form);
      } else {
        await pb.collection("forms").create(form);
      }
      navigate("/admin/forms");
    } catch (error) {
      console.error("Error saving form:", error);
      alert("Błąd podczas zapisywania formularza.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Ładowanie edytora...</div>;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Link to="/admin/forms" className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 flex-1">
          {isEdit ? "Edycja formularza" : "Nowy formularz"}
        </h1>
        
        {isEdit && (
          <>
            <a
              href={`/formularz/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
              title="Otwórz podgląd formularza w nowej karcie"
            >
              <ExternalLink size={18} />
              Podgląd
            </a>
            
            <button
              onClick={copyFormLink}
              className="bg-white text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
              title="Kopiuj link do formularza do schowka"
            >
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              {copied ? "Skopiowano!" : "Kopiuj link"}
            </button>

            <button
              onClick={sendTestSubmission}
              disabled={sendingTest}
              className="bg-white text-blue-700 border border-blue-200 px-4 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              title="Wyślij testową wiadomość e-mail z tego formularza"
            >
              <Send size={18} className={sendingTest ? "animate-pulse" : ""} />
              {sendingTest ? "Wysyłanie testu..." : "Wyślij test"}
            </button>
          </>
        )}

        <button
          onClick={saveForm}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <Save size={20} />
          {saving ? "Zapisywanie..." : "Zapisz formularz"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
              <Settings size={20} className="text-gray-500" />
              Podstawowe ustawienia
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa formularza</label>
                <input
                  type="text"
                  value={form.title || ""}
                  onChange={handleTitleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="np. Rekrutacja do Liceum"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Krótki kod (Slug)</label>
                <input
                  type="text"
                  value={form.slug || ""}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
                  placeholder="np. rekrutacja-liceum"
                />
                <p className="text-xs text-gray-500 mt-1">Używany w adresie URL oraz do osadzania formularza na stronach.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opis (opcjonalny)</label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={2}
                  placeholder="Krótki tekst przed formularzem..."
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.is_active !== false}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Formularz jest aktywny i widoczny dla użytkowników</label>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                Pola formularza
              </h2>
              <button
                onClick={addField}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-md"
              >
                <Plus size={16} /> Dodaj pole
              </button>
            </div>
            
            {form.fields && form.fields.length > 0 ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={form.fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {form.fields.map((field, index) => (
                      <SortableField 
                        key={field.id} 
                        field={field} 
                        index={index} 
                        updateField={updateField} 
                        removeField={removeField} 
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <p className="text-gray-500 mb-3">Formularz nie ma jeszcze żadnych pól.</p>
                <button
                  onClick={addField}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm"
                >
                  Dodaj pierwsze pole
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Ustawienia akcji
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Docelowy e-mail</label>
                <input
                  type="email"
                  value={form.target_email || ""}
                  onChange={(e) => setForm({ ...form, target_email: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="sekretariat@szkola.pl"
                />
                <p className="text-xs text-gray-500 mt-1">Gdzie wysyłać powiadomienia po wypełnieniu.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tekst przycisku</label>
                <input
                  type="text"
                  value={form.submit_button_text || ""}
                  onChange={(e) => setForm({ ...form, submit_button_text: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Wyślij wiadomość"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Komunikat po wysłaniu</label>
                <textarea
                  value={form.success_message || ""}
                  onChange={(e) => setForm({ ...form, success_message: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFormEditor;
