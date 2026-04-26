import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { pb } from "../services/pocketbase";
import { Subpage, getFileUrl } from "../lib/types";
import SunEditor from "suneditor-react";
import SunEditorCore from "suneditor/src/lib/core";
import plugins from "suneditor/src/plugins";
import "suneditor/dist/css/suneditor.min.css";
import pl from "suneditor/src/lang/pl";
import ConfirmationModal from "./ConfirmationModal";
import { Upload, Trash2, FileText, Link as LinkIcon, X, CheckCircle, ChevronDown, ChevronUp, Pencil, Save as SaveIcon } from "lucide-react";
import Toast from "./Toast";
import InputModal from "./InputModal";
import FileSelectModal from "./FileSelectModal";
import IconPicker from "./IconPicker";
import DynamicIcon from "./DynamicIcon";
import GalleryUploader from "./GalleryUploader";
import { generateBaseSlug, ensureUniqueSlug } from "../lib/slugUtils";

const AdminSubpageForm: React.FC = () => {
  const [subpage, setSubpage] = useState<Partial<Subpage>>({
    title: "",
    slug: "",
    content: "",
    published: false,
    files: [],
  });
  const [newFiles, setNewFiles] = useState<File[]>([]); // Nowy stan dla plików
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]); // Stan dla plików do usunięcia
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [galleryToDelete, setGalleryToDelete] = useState<string[]>([]);

  // Stan widoczności sekcji plików (domyślnie ukryta)
  const [showFilesSection, setShowFilesSection] = useState(false);

  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [currentFileForIcon, setCurrentFileForIcon] = useState<string | null>(null);

  // Upload Progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const MAX_FILE_SIZE = 104857600; // 100 MB in bytes

  // Stan edycji nazwy pliku
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [tempFileName, setTempFileName] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSuccess, setIsSuccess] = useState(false); // Stan do koloru przycisku
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);

  // Modal Input state
  const [isLinkModalOpen, setLinkModalOpen] = useState(false);
  const [isFileSelectModalOpen, setFileSelectModalOpen] = useState(false);
  const [fileSelectInitialText, setFileSelectInitialText] = useState("");
  const [linkModalReq, setLinkModalReq] = useState<{ fileName: string } | null>(
    null
  );

  // Field name detection
  const [fileFieldName, setFileFieldName] = useState("files");

  const docInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<SunEditorCore>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Nasłuchiwanie na CustomEvent z pluginu SunEditora
  useEffect(() => {
    const handleOpenFileSelect = (e: any) => {
      setFileSelectInitialText(e.detail || "");
      setFileSelectModalOpen(true);
    };
    document.addEventListener("open-file-select-modal", handleOpenFileSelect);
    return () => document.removeEventListener("open-file-select-modal", handleOpenFileSelect);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    if (id) {
      setIsLoading(true);
      setError("");
      pb.collection("subpages")
        .getOne<Subpage>(id, { signal: controller.signal })
        .then((record) => {
          if (!controller.signal.aborted) {
            console.log("Fetched record:", record);
            const keys = Object.keys(record);

            // Detect file field name
            let detectedField = "files";
            if (keys.includes("documents")) detectedField = "documents";
            else if (keys.includes("file")) detectedField = "file";
            else if (keys.includes("pliki")) detectedField = "pliki";
            else if (keys.includes("attachment")) detectedField = "attachment";
            else if (keys.includes("attachments")) detectedField = "attachments";
            else if (keys.includes("files")) detectedField = "files";

            console.log("Detected file field name:", detectedField);
            setFileFieldName(detectedField);
            setSubpage({
              ...record,
              // Normalize files to always be in 'files' property of local state
              files: (record as any)[detectedField] || [],
            });
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
            setIsLoading(false);
          }
        });
    }

    return () => {
      controller.abort();
    };
  }, [id]);

  const generateSlug = useCallback((title: string) => {
    return generateBaseSlug(title);
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

  // --- LOGIKA PLIKÓW ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(""); // Czyścimy błędy przy nowym wyborze
    if (e.target.files) {
      const filesArray = Array.from(e.target.files) as File[];
      
      // Sprawdź rozmiar każdego pliku (limit 100MB)
      const oversized = filesArray.filter(f => f.size > MAX_FILE_SIZE);
      if (oversized.length > 0) {
        setError(`Plik "${oversized[0].name}" jest za duży. Maksymalny rozmiar to 100MB.`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

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
    setSubpage((prev) => ({
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
    if (!linkModalReq || !editorRef.current || !subpage.collectionId || !subpage.id)
      return;

    const fileName = linkModalReq.fileName;
    // Używamy getFileUrl
    const url = getFileUrl(subpage.collectionId, subpage.id, fileName);
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
      setSubpage(prev => ({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    if (!subpage.title?.trim()) {
      setError("Tytuł podstrony nie może być pusty.");
      setIsSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const formData = new FormData();
    
    // Sprawdzanie unikalności tytułu (aby uniknąć duplikatów i konfliktów slugów)
    try {
      const filter = id 
        ? `title = "${subpage.title}" && id != "${id}"` 
        : `title = "${subpage.title}"`;
      
      const existingRecord = await pb.collection("subpages").getList(1, 1, {
        filter: filter,
      });

      if (existingRecord.totalItems > 0) {
        setError(`Podstrona o tytule "${subpage.title}" już istnieje. Każda podstrona musi mieć unikalną nazwę.`);
        setIsSaving(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    } catch (err) {
      console.error("Błąd podczas sprawdzania unikalności tytułu:", err);
    }

    // Zapewniamy unikalność sluga przed zapisem
    const uniqueSlug = await ensureUniqueSlug(
      "subpages", 
      subpage.slug || generateBaseSlug(subpage.title || ""), 
      id
    );

    formData.append("title", subpage.title || "");
    formData.append("slug", uniqueSlug);
    // PocketBase może wymagać niepustego pola content, więc jeśli jest puste, wysyłamy spację
    // Pozwala to na zapisywanie podstron, które mają tylko pliki lub galerię.
    formData.append("content", subpage.content || " ");

    // Obsługa plików (dokumentów) - tylko NOWE pliki i USUNIĘTE
    console.log("Files to delete:", filesToDelete);
    console.log("Using field name:", fileFieldName);
    if (filesToDelete.length > 0) {
      filesToDelete.forEach((fileName) => {
        formData.append(fileFieldName + "-", fileName);
      });
    }

    console.log("New files to add:", newFiles);
    newFiles.forEach((file) => {
      // Używamy składni z plusem (np. 'files+'), aby dodać pliki do istniejącyh
      formData.append(fileFieldName + "+", file);
    });

    if (subpage.file_icons) {
      formData.append("file_icons", JSON.stringify(subpage.file_icons));
    }

    if (subpage.file_names) {
      formData.append("file_names", JSON.stringify(subpage.file_names));
    }

    // Obsługa galerii
    if (galleryToDelete.length > 0) {
      galleryToDelete.forEach((fileName) => {
        formData.append("gallery-", fileName);
      });
    }
    newGalleryFiles.forEach((file) => {
      formData.append("gallery+", file);
    });

    // Walidacja rozmiaru plików
    const allNewFiles = [
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

    // Walidacja czy jest jakakolwiek treść (tekst, pliki lub galeria)
    const hasTextContent = subpage.content && subpage.content.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim().length > 0;
    const hasFiles = (subpage.files && subpage.files.length > 0) || newFiles.length > 0;
    const hasGallery = (subpage.gallery && subpage.gallery.length > 0) || newGalleryFiles.length > 0;

    if (!hasTextContent && !hasFiles && !hasGallery) {
      setError(id ? "Nie udało się zaktualizować podstrony, ponieważ nie posiada ona żadnej treści (tekstu, plików ani galerii)." : "Nie udało się dodać podstrony, ponieważ nie posiada ona żadnej treści (tekstu, plików ani galerii).");
      setIsSaving(false);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Symulacja paska postępu
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) return prev;
        const remaining = 95 - prev;
        const increment = Math.max(1, Math.floor(remaining / 10));
        return prev + increment;
      });
    }, 500);


    try {
      if (id) {
        const updatedRecord = await pb.collection("subpages").update<Subpage>(id, formData);
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Aktualizacja stanu lokalnego danymi z serwera
        setSubpage(prev => ({
          ...prev,
          ...updatedRecord,
          files: (updatedRecord as any)[fileFieldName] || [],
          gallery: updatedRecord.gallery || []
        }));
        
        setNewFiles([]); 
        setNewGalleryFiles([]);
        setFilesToDelete([]); 
        setGalleryToDelete([]);
        setSuccess("Podstrona została zaktualizowana pomyślnie.");
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 2000);
      } else {
        const newRecord = await pb.collection("subpages").create<Subpage>(formData);
        clearInterval(progressInterval);
        setUploadProgress(100);
        setSubpage(newRecord);
        setNewFiles([]);
        setNewGalleryFiles([]);
        setFilesToDelete([]);
        setGalleryToDelete([]);
        setSuccess("Podstrona została utworzona pomyślnie.");
        setIsSuccess(true);
        navigate(`/admin/subpages/edit/${newRecord.id}`);
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error("Error saving subpage:", err);

      let errorMessage = id ? "Nie udało się zaktualizować podstrony." : "Nie udało się utworzyć podstrony.";

      // Obsługa specyficznych błędów PocketBase
      if (err.status === 400 && err.data?.data) {
        const fieldErrors = err.data.data;
        const details = Object.entries(fieldErrors)
          .map(([field, data]: [string, any]) => {
            let label = field;
            if (field === 'title') label = 'Tytuł';
            if (field === 'slug') label = 'Adres (slug)';
            if (field === 'content') label = 'Treść';
            return `${label}: ${data.message}`;
          })
          .join(", ");
        errorMessage = `Błąd walidacji danych: ${details}`;
      } else if (err.status === 401 || err.status === 403) {
        errorMessage = "Twoja sesja logowania wygasła lub nie masz uprawnień do tej operacji. Zaloguj się ponownie.";
      } else if (err.status === 0) {
        errorMessage = "Błąd połączenia z serwerem. Sprawdź połączenie internetowe lub spróbuj później.";
      } else if (err.originalError?.message === "Failed to fetch") {
        errorMessage = "Serwer jest nieosiągalny. Może być aktualizowany lub wyłączony.";
      } else if (err.message) {
        errorMessage = `Wystąpił nieoczekiwany błąd: ${err.message}`;
      }

      setError(errorMessage);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    navigate('/admin/subpages');
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
          <div className="space-y-6 bg-white p-8 shadow-md rounded-lg">
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-96 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </main>
        <aside className="sticky top-24">
          <div className="bg-white p-6 shadow-md rounded-lg h-48"></div>
        </aside>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8 items-start">
      <main>
        <h1 className="text-2xl font-bold mb-6">
          {id ? "Edytuj podstronę" : "Dodaj nową podstronę"}
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 shadow-sm rounded-r-md animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3">
              <X className="flex-shrink-0 text-red-500" size={20} />
              <p className="font-medium text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}

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

          {/* GALERIA */}
          <GalleryUploader
            existingGallery={subpage.gallery}
            newFiles={newGalleryFiles}
            onFilesSelect={(files) => setNewGalleryFiles(prev => [...prev, ...files])}
            onRemoveExisting={(fileName) => {
              setSubpage(prev => ({ ...prev, gallery: prev.gallery?.filter(f => f !== fileName) || [] }));
              setGalleryToDelete(prev => [...prev, fileName]);
            }}
            onRemoveNew={(index) => setNewGalleryFiles(prev => prev.filter((_, i) => i !== index))}
            collectionId={subpage.collectionId}
            recordId={subpage.id}
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
                    Pliki do pobrania
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
              <div className="space-y-2 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Istniejące pliki */}
                {subpage.files?.map((fileName, index) => (
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
                                setSubpage(prev => ({
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
                              setSubpage(prev => ({
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
                              {subpage.file_names?.[fileName] || fileName}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFile(fileName);
                                setTempFileName(subpage.file_names?.[fileName] || fileName); // Ustawiamy nazwę wyświetlaną lub nazwę pliku jako startową
                              }}
                              className="text-gray-400 hover:text-indigo-600 p-0.5"
                              title="Edytuj nazwę wyświetlaną"
                            >
                              <Pencil size={12} />
                            </button>
                          </div>
                          {(subpage.file_names?.[fileName] && subpage.file_names[fileName] !== fileName) && (
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
                          onClick={() => openLinkModal(fileName)}
                          className="text-indigo-600 hover:text-indigo-800 p-1"
                          title="Wstaw link do treści"
                        >
                          <LinkIcon size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentFileForIcon(fileName);
                            setIconPickerOpen(true);
                          }}
                          className="p-1 hover:bg-gray-200 rounded text-gray-600 flex items-center gap-1 border border-gray-300 px-2"
                          title="Zmień ikonę pliku"
                        >
                          {subpage.file_icons?.[fileName] ? (
                            <>
                              <DynamicIcon name={subpage.file_icons[fileName]} size={16} />
                              <span className="text-xs">{subpage.file_icons[fileName]}</span>
                            </>
                          ) : (
                            <span className="text-xs">Ikona</span>
                          )}
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

                {(newFiles.length > 0) && (
                  <p className="text-xs text-amber-600 mb-4 flex items-center gap-1">
                    <span className="font-bold">Uwaga:</span> Linkowanie do nowych plików możliwe dopiero po zapisaniu podstrony.
                  </p>
                )}
                {!subpage.files?.length && !newFiles.length && (
                  <p className="text-sm text-gray-400 italic text-center py-4">Brak załączonych plików.</p>
                )}
              </div>
            )}
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
              getSunEditorInstance={(editor) => (editorRef.current = editor)}
              setOptions={{
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
                      document.dispatchEvent(new CustomEvent('open-file-select-modal', { detail: selectedText }));
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
                  ["table", "link", "insertFilePlugin", "image"],
                  ["fullScreen", "showBlocks", "codeView"],
                ],
              }}
            />
          </div>

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
        files={subpage.files || []}
        fileNames={subpage.file_names}
        defaultLabel={fileSelectInitialText}
        onConfirm={(fileName, label) => {
          if (!editorRef.current || !subpage.collectionId || !subpage.id) return;
          const url = getFileUrl(subpage.collectionId, subpage.id, fileName);
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
          selectedIcon={currentFileForIcon && subpage.file_icons ? subpage.file_icons[currentFileForIcon] : undefined}
          onFileSelect={undefined}
        />
      )}

      <aside className="sticky top-24">
        <div className="bg-white p-6 shadow-md rounded-lg flex flex-col gap-4">
          <button
            type="submit"
            form="subpage-form"
            disabled={isSaving}
            className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all flex flex-col justify-center items-center gap-1 ${isSuccess
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
                "Zapisz"
                )}
            </div>

            {isUploading && uploadProgress > 0 && (
                <div className="w-full bg-indigo-800/30 rounded-full h-1 mt-1 overflow-hidden">
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
