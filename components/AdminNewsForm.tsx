import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { pb } from "../services/pocketbase";
import { Post, getImageUrl, getFileUrl, Category } from "../lib/types";
import SunEditor from "suneditor-react";
import SunEditorCore from "suneditor/src/lib/core";
import plugins from "suneditor/src/plugins";
import "suneditor/dist/css/suneditor.min.css";
import pl from "suneditor/src/lang/pl";
import ConfirmationModal from "./ConfirmationModal";
import { X, Upload, Image as ImageIcon, Trash2, Calendar, FileText, Link as LinkIcon, CheckCircle, ChevronDown, ChevronUp, Pencil, Save as SaveIcon } from "lucide-react";
import Toast from "./Toast";
import InputModal from "./InputModal";
import IconPicker from "./IconPicker";
import { AdminEditContext } from '../lib/AdminEditContext';
import DynamicIcon from "./DynamicIcon";
import FileSelectModal from './FileSelectModal';
import GalleryUploader from './GalleryUploader';
import { generateBaseSlug, ensureUniqueSlug } from "../lib/slugUtils";

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

  // Stan widoczności sekcji plików (domyślnie ukryta)
  const [showFilesSection, setShowFilesSection] = useState(false);

  // Stan edycji nazwy pliku
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [tempFileName, setTempFileName] = useState("");

  // Stan dla plików do usunięcia
  const [galleryToDelete, setGalleryToDelete] = useState<string[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSuccess, setIsSuccess] = useState(false); // Color state
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);

  // Modal Input state
  const [isLinkModalOpen, setLinkModalOpen] = useState(false);
  const [isFileSelectModalOpen, setFileSelectModalOpen] = useState(false);
  const [fileSelectInitialText, setFileSelectInitialText] = useState("");
  const [linkModalReq, setLinkModalReq] = useState<{ fileName: string } | null>(
    null
  );

  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [currentFileForIcon, setCurrentFileForIcon] = useState<string | null>(null);

  // Upload Progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const MAX_FILE_SIZE = 104857600; // 100 MB in bytes

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null); // Ref dla inputa plików
  const editorRef = useRef<SunEditorCore>(); // Ref dla edytora
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Funkcja pomocnicza do formatowania daty z PocketBase (UTC) na format inputa (lokalny YYYY-MM-DDThh:mm)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    try {
      // PocketBase dates often come with a space instead of T
      const normalizedDate = dateString.replace(' ', 'T');
      const date = new Date(normalizedDate);
      if (isNaN(date.getTime())) return "";
      
      const offset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() - offset);
      return localDate.toISOString().slice(0, 16);
    } catch (e) {
      return "";
    }
  };

  // Field name detection
  const [fileFieldName, setFileFieldName] = useState("files");

  // Nasłuchiwanie na CustomEvent z pluginu SunEditora
  useEffect(() => {
    const handleOpenFileSelect = (e: any) => {
      setFileSelectInitialText(e.detail || "");
      setFileSelectModalOpen(true);
    };
    document.addEventListener("open-file-select-modal-news", handleOpenFileSelect);
    return () => document.removeEventListener("open-file-select-modal-news", handleOpenFileSelect);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    if (id) {
      setIsLoading(true);
      setError("");
      pb.collection("posts")
        .getOne<Post>(id, { signal: controller.signal })
        .then((record) => {
          if (!controller.signal.aborted) {
            // Detect file field name
            const keys = Object.keys(record);
            let detectedField = "files";
            if (keys.includes("documents")) detectedField = "documents";
            else if (keys.includes("file")) detectedField = "file";
            else if (keys.includes("pliki")) detectedField = "pliki";
            else if (keys.includes("attachment")) detectedField = "attachment";
            else if (keys.includes("attachments")) detectedField = "attachments";
            else if (keys.includes("files")) detectedField = "files";

            setFileFieldName(detectedField);

            // Przy wczytywaniu formatujemy datę do inputa
            setPost({
              ...record,
              date: record.date ? formatDateForInput(record.date) : "",
              // Normalize files to always be in 'files' property of local state
              files: (record as any)[detectedField] || [],
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
            setIsLoading(false);
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
      .getFullList<Category>({ sort: "name", requestKey: null })
      .then(setCategories)
      .catch((err) => {
        if (!err.isAbort) console.error("Error fetching categories:", err);
      });
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
    return generateBaseSlug(title);
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

  const handleFileIconSelect = (iconName: string) => {
    if (currentFileForIcon) {
      setPost(prev => ({
        ...prev,
        file_icons: {
          ...prev.file_icons,
          [currentFileForIcon]: iconName
        }
      }));
      setIconPickerOpen(false);
      setCurrentFileForIcon(null);
    }
  };

  // Zaktualizujmy zawartość po zmianach w edytorze
  const editorOptions = {
    stickyToolbar: 84,
    height: "400px",
    plugins: [
      ...(Object.values(plugins) as any[]),
      {
        name: 'insertFilePlugin',
        display: 'command',
        title: 'Wstaw załącznik',
        buttonClass: '',
        innerHTML: '<div style="display:flex;align-items:center;justify-content:center;background:rgba(79, 70, 229, 0.15);color:#4f46e5;border-radius:4px;width:24px;height:24px;margin:auto;" title="Wstaw załącznik"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 12v6"/><path d="m15 15-3-3-3 3"/></svg></div>',
        add: function (core: any, targetElement: any) {
          core.context.insertFilePlugin = { targetButton: targetElement };
        },
        action: function () {
          let selectedText = '';
          if (editorRef.current && editorRef.current.core) {
            const selection = editorRef.current.core.getSelection();
            if (selection) {
              selectedText = selection.toString();
            }
          }
          document.dispatchEvent(new CustomEvent('open-file-select-modal-news', { detail: selectedText }));
        }
      }
    ] as any,
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
      ["table", "link", "insertFilePlugin", "image", "video"],
      ["fullScreen", "showBlocks", "codeView"],
    ],
  };

  // --- SUBMIT ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    
    // Zapewniamy unikalność sluga przed zapisem
    const uniqueSlug = await ensureUniqueSlug(
      "posts", 
      post.slug || generateBaseSlug(post.title || ""), 
      id, 
      post.date
    );
    
    formData.append("title", post.title || "");
    formData.append("slug", uniqueSlug);
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
      formData.append("gallery+", file);
    });

    // Obsługa plików (dokumentów) - tylko NOWE pliki i USUNIĘTE
    if (filesToDelete.length > 0) {
      filesToDelete.forEach((fileName) => {
        formData.append(fileFieldName + "-", fileName);
      });
    }

    newFiles.forEach((file) => {
      // Używamy składni z plusem (np. 'files+'), aby dodać pliki do istniejących, zamiast je nadpisywać
      formData.append(fileFieldName + "+", file);
    });

    if (post.file_icons) {
      formData.append("file_icons", JSON.stringify(post.file_icons));
    }

    if (post.file_names) {
      formData.append("file_names", JSON.stringify(post.file_names));
    }

    // Walidacja rozmiaru plików
    const allNewFiles = [
      ...(coverImageFile ? [coverImageFile] : []),
      ...newGalleryFiles,
      ...newFiles
    ];

    const oversizedFiles = allNewFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(", ");
      setError(`Następujące pliki przekraczają limit 100MB: ${fileNames}`);
      setIsSaving(false);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Symulacja paska postępu (ponieważ JS SDK nie obsługuje natywnie onSendProgress przez fetch)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) return prev;
        const remaining = 95 - prev;
        const increment = Math.max(1, Math.floor(remaining / 10)); // Zwalniamy pod koniec
        return prev + increment;
      });
    }, 500);

    try {
      if (id) {
        const updatedRecord = await pb.collection("posts").update<Post>(id, formData);
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        setPost(prev => ({
          ...prev,
          files: (updatedRecord as any)[fileFieldName] || [], // Use detected field
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
        clearInterval(progressInterval);
        setUploadProgress(100);

        // Detect field for new record if not already detected (though create implies 'files' usually, but good to be safe if backend changes)
        // For new records, we might want to check what came back. 
        // But simply setting state is enough.

        setPost({
          ...newRecord,
          files: (newRecord as any)[fileFieldName] || [], // Use detected field (default 'files')
        });

        setNewFiles([]);
        setNewGalleryFiles([]);
        setFilesToDelete([]);
        setGalleryToDelete([]);
        setSuccess("Artykuł został utworzony pomyślnie.");
        setIsSuccess(true);
        navigate(`/admin/news/edit/${newRecord.id}`);
      }
    } catch (err) {
      clearInterval(progressInterval);
      console.error("Error saving post:", err);
      setError("Nie udało się zapisać artykułu.");
    } finally {
      setIsSaving(false);
      setIsUploading(false);
      setUploadProgress(0);
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

  if (isLoading && id) {
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
                  Zalecany format: JPG, PNG. Max 100MB.
                </p>
              </div>
            </div>
          </div>

          {/* GALERIA */}
          <GalleryUploader
            existingGallery={post.gallery}
            newFiles={newGalleryFiles}
            onFilesSelect={(files) => setNewGalleryFiles(prev => [...prev, ...files])}
            onRemoveExisting={removeExistingImage}
            onRemoveNew={removeNewFile}
            collectionId={post.collectionId}
            recordId={post.id}
          />

          {/* PLIKI DO POBRANIA */}
          <div className="border-t pt-6">
            <div
              className="flex justify-between items-center mb-4 cursor-pointer select-none"
              onClick={() => setShowFilesSection(!showFilesSection)}
            >
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 cursor-pointer">
                    Pliki do pobrania (PDF, DOCX itp.)
                  </label>
                  <p className="text-[10px] text-gray-500">Maksymalnie 100MB na plik.</p>
                </div>
                {showFilesSection ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
              </div>

              {showFilesSection && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    docInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors"
                  title="Dodaj dokumenty"
                >
                  <Upload size={16} />
                  Dodaj pliki
                </button>
              )}
              <input
                type="file"
                ref={docInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
              />
            </div>

            {showFilesSection && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Istniejące pliki */}
                {post.files?.map((fileName, index) => (
                  <div key={`existing-file-${index}`} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <div className="flex items-center gap-3 overflow-hidden flex-grow mr-2">
                      <FileText className="text-gray-400 flex-shrink-0" size={20} />

                      {editingFile === fileName ? (
                        <div className="flex items-center gap-2 flex-grow">
                          <input
                            type="text"
                            value={tempFileName}
                            onChange={(e) => setTempFileName(e.target.value)}
                            className="text-sm border rounded px-2 py-1 flex-grow outline-none focus:border-indigo-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                setPost(prev => ({
                                  ...prev,
                                  file_names: {
                                    ...prev.file_names,
                                    [fileName]: tempFileName
                                  }
                                }));
                                setEditingFile(null);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPost(prev => ({
                                ...prev,
                                file_names: {
                                  ...prev.file_names,
                                  [fileName]: tempFileName
                                }
                              }));
                              setEditingFile(null);
                            }}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Zapisz nazwę"
                          >
                            <SaveIcon size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingFile(null)}
                            className="text-gray-500 hover:text-gray-700 p-1"
                            title="Anuluj"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700 truncate font-medium max-w-[200px] sm:max-w-md">
                              {post.file_names?.[fileName] || fileName}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFile(fileName);
                                setTempFileName(post.file_names?.[fileName] || fileName);
                              }}
                              className="text-gray-400 hover:text-indigo-600 p-0.5"
                              title="Edytuj nazwę wyświetlaną"
                            >
                              <Pencil size={12} />
                            </button>
                          </div>
                          {(post.file_names?.[fileName] && post.file_names[fileName] !== fileName) && (
                            <span className="text-[10px] text-gray-400 truncate">{fileName}</span>
                          )}
                        </div>
                      )}

                      {editingFile !== fileName && (
                        <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">Zapisane</span>
                      )}
                    </div>

                    {editingFile !== fileName && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentFileForIcon(fileName);
                            setIconPickerOpen(true);
                          }}
                          className="p-1 hover:bg-gray-200 rounded text-gray-600 flex items-center gap-1 border border-gray-300 px-2"
                          title="Zmień ikonę pliku"
                        >
                          {post.file_icons?.[fileName] ? (
                            <>
                              <DynamicIcon name={post.file_icons[fileName]} size={16} />
                              <span className="text-xs">{post.file_icons[fileName]}</span>
                            </>
                          ) : (
                            <span className="text-xs">Ikona</span>
                          )}
                        </button>
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
                    )}
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
            )}

            {showFilesSection && (newFiles.length > 0) && (
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
              setOptions={editorOptions}
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

      <FileSelectModal
        isOpen={isFileSelectModalOpen}
        title="Wstaw załącznik do treści"
        files={post.files || []}
        fileNames={post.file_names}
        defaultLabel={fileSelectInitialText}
        onConfirm={(fileName, label) => {
          if (!editorRef.current || !post.collectionId || !post.id) return;
          const url = getFileUrl(post.collectionId, post.id, fileName);
          const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline font-medium">${label}</a>&nbsp;`;
          editorRef.current.insertHTML(linkHtml);
          setFileSelectModalOpen(false);
        }}
        onCancel={() => setFileSelectModalOpen(false)}
      />

      {iconPickerOpen && (
        <IconPicker
          onSelect={handleFileIconSelect}
          onClose={() => setIconPickerOpen(false)}
          selectedIcon={currentFileForIcon && post.file_icons ? post.file_icons[currentFileForIcon] : undefined}
          // Optional: allow uploading a custom icon for the file?
          // User requested adding icon to file.
          // I'll reuse the upload logic if I needed, but for now just picking icons.
          onFileSelect={undefined}
        />
      )}

      <aside className="sticky top-24">
        <div className="bg-white p-6 shadow-md rounded-lg flex flex-col gap-4">
          <div className="text-sm text-gray-500 mb-4 pb-4 border-b space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Status:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold ${post.published
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
            disabled={isSaving}
            className={`w-full px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all flex flex-col justify-center items-center gap-1 ${isSuccess
                ? "bg-green-600 hover:bg-green-700 ring-green-500"
                : "bg-indigo-600 hover:bg-indigo-700"
              }`}
          >
            <div className="flex items-center gap-2">
                {isSaving ? (
                isUploading ? `Przesyłanie ${uploadProgress}%...` : "Zapisywanie..."
                ) : isSuccess ? (
                <>
                    <CheckCircle size={18} />
                    Zapisano!
                </>
                ) : (
                "Zapisz zmiany"
                )}
            </div>
            
            {isUploading && uploadProgress > 0 && (
                <div className="w-full bg-indigo-800/30 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div 
                        className="bg-white h-full transition-all duration-300 ease-out" 
                        style={{ width: `${uploadProgress}%` }}
                    ></div>
                </div>
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
