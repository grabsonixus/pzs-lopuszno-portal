import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { pb } from "../services/pocketbase";
import { Subpage } from "../lib/types";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import pl from "suneditor/src/lang/pl";
import ConfirmationModal from "./ConfirmationModal";

const AdminSubpageForm: React.FC = () => {
  const [subpage, setSubpage] = useState<Partial<Subpage>>({
    title: "",
    slug: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const controller = new AbortController();
    if (id) {
      setLoading(true);
      setError("");
      pb.collection("subpages")
        .getOne<Subpage>(id, { signal: controller.signal })
        .then((record) => {
          if (!controller.signal.aborted) {
            setSubpage(record);
          }
        })
        .catch((err) => {
          if (!err.isAbort) {
            console.error("Error fetching subpage:", err);
            setError("Nie udało się wczytać podstrony.");
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        });
    }

    return () => {
      controller.abort();
    };
  }, [id]);

  const generateSlug = useCallback((title: string) => {
    return title

      .toLowerCase()

      .normalize("NFD")

      .replace(/[\u0300-\u036f]/g, "")

      .replace(/ł/g, "l")

      .replace(/[^\w\s-]/g, "")

      .replace(/[\s_-]+/g, "-")

      .replace(/^-+|-+$/g, "");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setSubpage((prev) => {
      const newSubpage = {
        ...prev,
        [name]: value,
      };

      if (name === "title") {
        newSubpage.slug = generateSlug(value);
      }

      return newSubpage;
    });
  };

  const handleContentChange = (content: string) => {
    setSubpage((prev) => ({ ...prev, content }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", subpage.title || "");
    formData.append("slug", subpage.slug || "");
    formData.append("content", subpage.content || "");

    try {
      if (id) {
        await pb.collection("subpages").update(id, formData);
      } else {
        await pb.collection("subpages").create(formData);
      }
      navigate("/admin/subpages");
    } catch (err) {
      console.error("Error saving subpage:", err);
      setError("Nie udało się zapisać podstrony.");
        } finally {
          setLoading(false);
        }
      };
    
      const handleCancel = () => {
        setCancelModalOpen(true);
      };
    
      const confirmCancel = () => {
        navigate('/admin/subpages');
        setCancelModalOpen(false);
      };
    
      const closeCancelModal = () => {
        setCancelModalOpen(false);
      };
    
      if (loading && id) return <p>Wczytywanie podstrony...</p>;
    
      return (
        <div className="container mx-auto p-4 max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8 items-start">
          <main>
            <h1 className="text-2xl font-bold mb-6">
              {id ? "Edytuj podstronę" : "Dodaj nową podstronę"}
            </h1>
            <form
              id="subpage-form"
              onSubmit={handleSubmit}
              className="space-y-6 bg-white p-8 shadow-md rounded-lg"
            >
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tytuł
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={subpage.title}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
    
              <div>
                <label
                  htmlFor="slug"
                  className="block text-sm font-medium text-gray-700"
                >
                  Slug
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={subpage.slug}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100"
                  required
                  readOnly
                />
              </div>
    
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700"
                >
                  Treść
                </label>
                <SunEditor
                  key={id || 'new'}
                  lang={pl}
                  defaultValue={subpage.content || ''}
                  onChange={handleContentChange}
                  setOptions={{
                    stickyToolbar: 84,
                    height: "400px",
                    buttonList: [
                      ["undo", "redo"],
                      ["font", "fontSize", "formatBlock"],
                      [
                        "bold",
                        "underline",
                        "italic",
                        "strike",
                        "subscript",
                        "superscript",
                      ],
                      ["removeFormat"],
                      "/", // Line break
                      ["fontColor", "hiliteColor"],
                      ["outdent", "indent"],
                      ["align", "horizontalRule", "list", "lineHeight"],
                      ["table", "link", "image"],
                      ["fullScreen", "showBlocks", "codeView"],
                    ],
                  }}
                />
              </div>
    
              {error && <p className="text-red-500">{error}</p>}
            </form>
          </main>
    
          <aside className="sticky top-24">
            <div className="bg-white p-6 shadow-md rounded-lg flex flex-col gap-4">
                <button
                    type="submit"
                    form="subpage-form"
                    disabled={loading}
                    className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    {loading ? "Zapisywanie..." : "Zapisz"}
                </button>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full px-4 py-2 border rounded-md text-sm font-medium text-center"
                >
                    Anuluj
                </button>
            </div>
          </aside>
          <ConfirmationModal
            isOpen={isCancelModalOpen}
            title="Potwierdzenie anulowania"
            message="Czy na pewno chcesz anulować? Niezapisane zmiany zostaną utracone."
            onConfirm={confirmCancel}
            onCancel={closeCancelModal}
            confirmText="Tak, anuluj"
            cancelText="Nie, kontynuuj edycję"
          />
        </div>
      );
    };

export default AdminSubpageForm;
