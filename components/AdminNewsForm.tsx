import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { pb } from "../services/pocketbase";
import { Post, getImageUrl, getFileUrl, Category } from "../lib/types";
import SunEditor from "suneditor-react";
import SunEditorCore from "suneditor/src/lib/core";
import "suneditor/dist/css/suneditor.min.css";
import pl from "suneditor/src/lang/pl";
import ConfirmationModal from "./ConfirmationModal";
import { X, Upload, Image as ImageIcon, Trash2, Calendar, FileText, Link as LinkIcon, CheckCircle } from "lucide-react";
import Toast from "./Toast";
import InputModal from "./InputModal";

const AdminNewsForm: React.FC = () => {
  const [post, setPost] = useState<Partial<Post>>({
    title: "",
    slug: "",
    content: "",
    published: false,
    date: "", // Pole daty
    category: "", // Dodane pole kategorii
    gallery: [],
  });

  const [categories, setCategories] = useState<Category[]>([]); // Stan dla kategorii
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]); // Nowy stan dla plików dokumentów
  
  // Stan dla plików do usunięcia
  const [galleryToDelete, setGalleryToDelete] = useState<string[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSuccess, setIsSuccess] = useState(false); // Color state
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  
  // Modal Input state
  const [isLinkModalOpen, setLinkModalOpen] = useState(false);
  const [linkModalReq, setLinkModalReq] = useState<{ fileName: string } | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null); // Ref dla inputa plików
  const editorRef = useRef<SunEditorCore>(); // Ref dla edytora
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Funkcja pomocnicza do formatowania daty z PocketBase (UTC) na format inputa (lokalny YYYY-MM-DDThh:mm)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Przesunięcie strefy czasowej w minutach, konwersja na milisekundy
    // Odejmujemy offset, ponieważ getTimezoneOffset zwraca minuty różnicy (np. -120 dla GMT+2)
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const controller = new AbortController();
    if (id) {
      setLoading(true);
      setError("");
      pb.collection("posts")
        .getOne<Post>(id, { signal: controller.signal })
        .then((record) => {
          if (!controller.signal.aborted) {
            // Przy wczytywaniu formatujemy datę do inputa
            setPost({
              ...record,
              date: record.date ? formatDateForInput(record.date) : "",
            });

            // Ustaw podgląd istniejącej okładki
            if (record.cover_image) {
              setCoverPreview(
                getImageUrl(record.collectionId, record.id, record.cover_image)
              );
            }
          }
        })
        .catch((err) => {
          if (!err.isAbort) {
            console.error("Error fetching post:", err);
            setError("Nie udało się wczytać artykułu.");
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        });
    } else {
      // Dla nowego postu ustawiamy dzisiejszą datę jako domyślną
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      const localNow = new Date(now.getTime() - offset)
        .toISOString()
        .slice(0, 16);
      setPost((prev) => ({ ...prev, date: localNow }));
    }

    return () => {
      controller.abort();
    };
  }, [id]);

  // Pobieranie kategorii
  useEffect(() => {
    pb.collection("categories")
      .getFullList<Category>({ sort: "name" })
      .then(setCategories)
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // Sprzątanie adresów URL blobów
  useEffect(() => {
    return () => {
      newGalleryFiles.forEach((file) =>
        URL.revokeObjectURL(URL.createObjectURL(file))
      );
    };
  }, [newGalleryFiles]);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setPost((prev) => {
      const newPost = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "title") {
        newPost.slug = generateSlug(value);
      }

      return newPost;
    });
  };

  const handleContentChange = (content: string) => {
    setPost((prev) => ({ ...prev, content }));
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // --- LOGIKA GALERII ---

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files) as File[];
      const validImages = filesArray.filter((file) =>
        file.type.startsWith("image/")
      );

      setNewGalleryFiles((prev) => [...prev, ...validImages]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeNewFile = (indexToRemove: number) => {
    setNewGalleryFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const removeExistingImage = (imageName: string) => {
    setPost((prev) => ({
      ...prev,
      gallery: prev.gallery?.filter((img) => img !== imageName) || [],
    }));
    setGalleryToDelete((prev) => [...prev, imageName]);
  };

  // --- LOGIKA PLIKÓW (DOKUMENTÓW) ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files) as File[];
      // Filtrujemy, żeby nie brać zdjęć jeśli nie chcemy, ale tu bierzemy wszystko co nie jest obrazkiem (opcjonalnie)
      // lub po prostu wszystko. PocketBase 'file' field przyjmie wszystko.
      setNewFiles((prev) => [...prev, ...filesArray]);

      if (docInputRef.current) {
        docInputRef.current.value = "";
      }
    }
  };

  const removeNewDocFile = (indexToRemove: number) => {
    setNewFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeExistingDocFile = (fileName: string) => {
    setPost((prev) => ({
      ...prev,
      files: prev.files?.filter((f) => f !== fileName) || [],
    }));
    setFilesToDelete((prev) => [...prev, fileName]);
  };

  const openLinkModal = (fileName: string) => {
    setLinkModalReq({ fileName });
    setLinkModalOpen(true);
  };

  const handleLinkModalConfirm = (label: string) => {
    if (!linkModalReq || !editorRef.current || !post.collectionId || !post.id)
      return;

    const fileName = linkModalReq.fileName;
    // Używamy getFileUrl
    const url = getFileUrl(post.collectionId, post.id, fileName);
    const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline font-medium">${label}</a>&nbsp;`;

    editorRef.current.insertHTML(linkHtml);
    setLinkModalOpen(false);
    setLinkModalReq(null);
  };

  const cleanSuccess = () => {
    setSuccess("");
    setIsSuccess(false);
  };

  // --- SUBMIT ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("title", post.title || "");
    formData.append("slug", post.slug || "");
    formData.append("content", post.content || "");
    formData.append("published", String(post.published || false));
    if (post.category) {
        formData.append("category", post.category);
    }

    // Dodajemy datę. Jeśli jest pusta, PocketBase użyje "teraz" lub null w zależności od konfiguracji,
    // ale lepiej wysłać datę jeśli użytkownik ją ustawił.
    if (post.date) {
      // PocketBase oczekuje daty w formacie UTC.
      // Konstruktor Date() poprawnie zinterpretuje string z inputa 'datetime-local' jako czas lokalny przeglądarki
      // i .toISOString() przekonwertuje go na UTC dla bazy danych.
      formData.append("date", new Date(post.date).toISOString());
    }

    if (coverImageFile) {
      formData.append("cover_image", coverImageFile);
    }

    // Obsługa galerii
    // Obsługa galerii - tylko NOWE pliki i USUNIĘTE
    // Nie przesyłamy istniejących nazw (ciągów znaków) do pola 'gallery', bo PocketBase to ignoruje w FormData
    // Aby usunąć, używamy klucza 'gallery-' (minus na końcu)
    if (galleryToDelete.length > 0) {
        galleryToDelete.forEach((imageName) => {
            formData.append("gallery-", imageName);
        });
    }

    newGalleryFiles.forEach((file) => {
      formData.append("gallery", file);
    });

    // Obsługa plików (dokumentów) - tylko NOWE pliki i USUNIĘTE
    if (filesToDelete.length > 0) {
        filesToDelete.forEach((fileName) => {
            formData.append("files-", fileName);
        });
    }

    newFiles.forEach((file) => {
        formData.append("files", file);
    });

    try {
      if (id) {
        const updatedRecord = await pb.collection("posts").update<Post>(id, formData);
        setPost(prev => ({
            ...prev,
            files: updatedRecord.files,
            gallery: updatedRecord.gallery
        }));
        setNewFiles([]); // Wyczyść nowe pliki
        setNewGalleryFiles([]); // Wyczyść nowe zdjęcia
        setFilesToDelete([]); // Wyczyść do usunięcia
        setGalleryToDelete([]); // Wyczyść do usunięcia
        setSuccess("Artykuł został zaktualizowany pomyślnie.");
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 2000);
      } else {
        const newRecord = await pb.collection("posts").create<Post>(formData);
        setPost(newRecord); // Ustaw pełny rekord
        setNewFiles([]);
        setNewGalleryFiles([]);
        setFilesToDelete([]);
        setGalleryToDelete([]);
        setSuccess("Artykuł został utworzony pomyślnie.");
        setIsSuccess(true);
        navigate(`/admin/news/edit/${newRecord.id}`);
      }
    } catch (err) {
      console.error("Error saving post:", err);
      setError("Nie udało się zapisać artykułu.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCancelModalOpen(true);
  };

  const confirmCancel = () => {
    navigate("/admin/news");
    setCancelModalOpen(false);
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
  };

  if (loading && id) {
      return (
        <div className="container mx-auto p-4 max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8 items-start animate-pulse">
            <main>
                <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
                <div className="space-y-8 bg-white p-8 shadow-md rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                             <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                             <div className="h-10 bg-gray-200 rounded w-full"></div>
                        </div>
                        <div>
                             <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                             <div className="h-10 bg-gray-200 rounded w-full"></div>
                        </div>
                        <div>
                             <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                             <div className="h-10 bg-gray-200 rounded w-full"></div>
                        </div>
                    </div>
                    <div className="border-t pt-6">
                         <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
                         <div className="h-40 bg-gray-200 rounded w-full"></div>
                    </div>
                </div>
            </main>
            <aside className="sticky top-24">
                <div className="bg-white p-6 shadow-md rounded-lg h-64"></div>
            </aside>
        </div>
      );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8 items-start">
      <main>
        <h1 className="text-2xl font-bold mb-6">
          {id ? "Edytuj artykuł" : "Dodaj nowy artykuł"}
        </h1>
        <form
          id="news-form"
          onSubmit={handleSubmit}
          className="space-y-8 bg-white p-8 shadow-md rounded-lg"
        >
          {/* GÓRNA SEKCJA: Tytuł, Slug, Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
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
                value={post.title}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700"
              >
                Slug (URL)
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={post.slug}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                required
                readOnly
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 flex items-center gap-1"
              >
                <Calendar size={14} />
                Data publikacji
              </label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                value={post.date}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Pozostawienie pustego pola ustawi datę utworzenia.
              </p>
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Kategoria
              </label>
              <select
                id="category"
                name="category"
                value={post.category || ""}
                onChange={(e) => setPost((prev) => ({ ...prev, category: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Wybierz kategorię</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Zdjęcie okładkowe */}
          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zdjęcie główne (Okładka)
            </label>
            <div className="flex items-start gap-6">
              <div className="w-40 h-28 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                {coverPreview ? (
                  <>
                    <img
                      src={coverPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        Zmień
                      </span>
                    </div>
                  </>
                ) : (
                  <ImageIcon className="text-gray-400" size={32} />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="cover_image"
                  name="cover_image"
                  onChange={handleCoverImageChange}
                  accept="image/*"
                  className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Zalecany format: JPG, PNG. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* GALERIA ZDJĘĆ */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Galeria zdjęć
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors"
              >
                <Upload size={16} />
                Dodaj zdjęcia
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleGallerySelect}
                className="hidden"
                multiple
                accept="image/*"
              />
            </div>

            {/* Kontener na miniatury */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Istniejące zdjęcia */}
              {post.gallery?.map((imageName, index) => (
                <div
                  key={`existing-${index}`}
                  className="relative group aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
                >
                  <img
                    src={
                      post.collectionId && post.id
                        ? getImageUrl(post.collectionId, post.id, imageName)
                        : ""
                    }
                    alt={`Gallery ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeExistingImage(imageName)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors transform hover:scale-110"
                      title="Usuń zdjęcie"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate text-center">
                    Zapisane
                  </div>
                </div>
              ))}

              {/* Nowe zdjęcia */}
              {newGalleryFiles.map((file, index) => (
                <div
                  key={`new-${index}`}
                  className="relative group aspect-square bg-indigo-50 rounded-lg overflow-hidden border-2 border-indigo-100"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`New ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors transform hover:scale-110"
                      title="Usuń z wyboru"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-indigo-600 text-white text-[10px] px-2 py-1 truncate text-center">
                    Nowe
                  </div>
                </div>
              ))}

              {!post.gallery?.length && !newGalleryFiles.length && (
                <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400">
                  <ImageIcon className="mx-auto mb-2 opacity-50" size={48} />
                  <p className="text-sm">
                    Brak zdjęć w galerii. Kliknij "Dodaj zdjęcia" aby przesłać
                    pliki.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* PLIKI DO POBRANIA */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Pliki do pobrania (PDF, DOCX itp.)
              </label>
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors"
                title="Dodaj dokumenty"
              >
                <Upload size={16} />
                Dodaj pliki
              </button>
              <input
                type="file"
                ref={docInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
              />
            </div>

            <div className="space-y-2">
                {/* Istniejące pliki */}
                {post.files?.map((fileName, index) => (
                    <div key={`existing-file-${index}`} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <FileText className="text-gray-400 flex-shrink-0" size={20} />
                            <span className="text-sm text-gray-700 truncate font-medium">{fileName}</span>
                            <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full">Zapisane</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => openLinkModal(fileName)}
                                className="text-indigo-600 hover:text-indigo-800 p-1"
                                title="Wstaw link do treści"
                            >
                                <LinkIcon size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={() => removeExistingDocFile(fileName)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Usuń plik"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Nowe pliki */}
                {newFiles.map((file, index) => (
                    <div key={`new-file-${index}`} className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-md">
                         <div className="flex items-center gap-3 overflow-hidden">
                            <FileText className="text-indigo-400 flex-shrink-0" size={20} />
                            <span className="text-sm text-gray-700 truncate font-medium">{file.name}</span>
                            <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full">Nowe</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeNewDocFile(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Usuń z wyboru"
                        >
                            <X size={18} />
                        </button>
                    </div>
                ))}
                 {!post.files?.length && !newFiles.length && (
                    <p className="text-sm text-gray-400 italic text-center py-4">Brak załączonych plików.</p>
                 )}
            </div>
            
            {(newFiles.length > 0) && (
                 <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <span className="font-bold">Uwaga:</span> Linkowanie do nowych plików możliwe dopiero po zapisaniu artykułu.
                 </p>
            )}
          </div>

          {/* Edytor treści */}
          <div className="border-t pt-6">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Treść artykułu
            </label>
            <SunEditor
              key={id || "new"}
              lang={pl}
              defaultValue={post.content || ""}
              onChange={handleContentChange}
              getSunEditorInstance={(editor) => (editorRef.current = editor)}
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
                  "/",
                  ["fontColor", "hiliteColor"],
                  ["outdent", "indent"],
                  ["align", "horizontalRule", "list", "lineHeight"],
                  ["table", "link", "image"],
                  ["fullScreen", "showBlocks", "codeView"],
                ],
              }}
            />
          </div>



          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </form>
      </main>

      <Toast
        message={success}
        type="success"
        onClose={cleanSuccess}
        duration={4000}
      />

      <InputModal
        isOpen={isLinkModalOpen}
        title="Wstaw link do pliku"
        message={`Podaj tekst, który będzie wyświetlany jako link do pliku "${linkModalReq?.fileName}".`}
        defaultValue={linkModalReq?.fileName}
        onConfirm={handleLinkModalConfirm}
        onCancel={() => setLinkModalOpen(false)}
        confirmText="Wstaw link"
        inputPlaceholder="Np. Pobierz plan lekcji"
      />

      <aside className="sticky top-24">
        <div className="bg-white p-6 shadow-md rounded-lg flex flex-col gap-4">
          <div className="text-sm text-gray-500 mb-4 pb-4 border-b space-y-4">
            <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                    post.published
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                >
                    {post.published ? "Opublikowany" : "Szkic"}
                </span>
            </div>
            
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="published-sidebar"
                    name="published"
                    checked={post.published}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label
                    htmlFor="published-sidebar"
                    className="text-sm text-gray-700 font-medium cursor-pointer"
                >
                    Opublikuj na stronie
                </label>
            </div>
          </div>
          <button
            type="submit"
            form="news-form"
            disabled={loading}
            className={`w-full px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all flex justify-center items-center gap-2 ${
              isSuccess
                ? "bg-green-600 hover:bg-green-700 ring-green-500"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? (
              "Zapisywanie..."
            ) : isSuccess ? (
              <>
                <CheckCircle size={18} />
                Zapisano!
              </>
            ) : (
              "Zapisz zmiany"
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
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

export default AdminNewsForm;
