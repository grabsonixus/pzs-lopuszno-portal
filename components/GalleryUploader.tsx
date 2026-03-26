import React, { useRef, useState } from "react";
import { Upload, X, Trash2, Image as ImageIcon, Video, Loader2 } from "lucide-react";
import { getImageUrl } from "../lib/types";
import { compressImage } from "../lib/mediaCompression";

interface GalleryUploaderProps {
    existingGallery: string[] | undefined;
    newFiles: File[];
    onFilesSelect: (files: File[]) => void;
    onRemoveExisting: (fileName: string) => void;
    onRemoveNew: (index: number) => void;
    collectionId?: string;
    recordId?: string;
}

const GalleryUploader: React.FC<GalleryUploaderProps> = ({
    existingGallery = [],
    newFiles = [],
    onFilesSelect,
    onRemoveExisting,
    onRemoveNew,
    collectionId,
    recordId,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [compressing, setCompressing] = useState(false);
    const [progress, setProgress] = useState<{ [key: string]: number }>({});

    const isVideo = (name: string) => {
        return name.match(/\.(mp4|webm|ogg|mov)$/i) || false;
    };

    const processFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const filesArray: File[] = Array.from(e.target.files);

        // Clear input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        const imageFiles = filesArray.filter(f => f.type.startsWith("image/"));
        const videoFiles = filesArray.filter(f => f.type.startsWith("video/"));

        // Videos are added directly – no conversion needed
        const processedFiles: File[] = [...videoFiles];

        // Images get compressed + converted to WebP
        if (imageFiles.length > 0) {
            setCompressing(true);
            for (const file of imageFiles) {
                const uniqueKey = file.name + Date.now();
                setProgress(prev => ({ ...prev, [uniqueKey]: 0 }));
                const compressed = await compressImage(file);
                processedFiles.push(compressed);
                setProgress(prev => ({ ...prev, [uniqueKey]: 100 }));
            }
            setCompressing(false);
            setProgress({});
        }

        onFilesSelect(processedFiles);
    };

    return (
        <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                    Galeria (zdjęcia i wideo)
                </label>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={compressing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {compressing ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                    Dodaj pliki
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={processFiles}
                    className="hidden"
                    multiple
                    accept="image/*,video/*"
                />
            </div>

            {compressing && (
                <div className="mb-4 text-sm text-indigo-600 space-y-2">
                    <p className="font-semibold flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Trwa kompresja i konwersja plików... To może chwilę potrwać.</p>
                    {Object.entries(progress).map(([key, val]) => (
                        <div key={key} className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${val}%` }}></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Kontener na miniatury */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Istniejące pliki */}
                {existingGallery.map((fileName, index) => (
                    <div
                        key={`existing-${index}`}
                        className="relative group aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
                    >
                        {isVideo(fileName) ? (
                            <video
                                src={collectionId && recordId ? getImageUrl(collectionId, recordId, fileName) : ""}
                                className="w-full h-full object-cover"
                                muted
                                loop
                                playsInline
                                onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                                onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
                            />
                        ) : (
                            <img
                                src={collectionId && recordId ? getImageUrl(collectionId, recordId, fileName) : ""}
                                alt={`Gallery ${index}`}
                                className="w-full h-full object-cover"
                            />
                        )}

                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() => onRemoveExisting(fileName)}
                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors transform hover:scale-110"
                                title="Usuń plik"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <div className="absolute top-2 left-2 text-white bg-black/50 rounded p-1">
                            {isVideo(fileName) ? <Video size={14} /> : <ImageIcon size={14} />}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate text-center">
                            Zapisane
                        </div>
                    </div>
                ))}

                {/* Nowe pliki */}
                {newFiles.map((file, index) => {
                    const url = URL.createObjectURL(file);
                    const isVid = file.type.startsWith("video/");
                    return (
                        <div
                            key={`new-${index}`}
                            className="relative group aspect-square bg-indigo-50 rounded-lg overflow-hidden border-2 border-indigo-100"
                        >
                            {isVid ? (
                                <video src={url} className="w-full h-full object-cover" muted />
                            ) : (
                                <img src={url} alt={`New ${index}`} className="w-full h-full object-cover" />
                            )}

                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => onRemoveNew(index)}
                                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors transform hover:scale-110"
                                    title="Usuń z wyboru"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="absolute top-2 left-2 text-white bg-indigo-600/50 rounded p-1">
                                {isVid ? <Video size={14} /> : <ImageIcon size={14} />}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-indigo-600 text-white text-[10px] px-2 py-1 truncate text-center">
                                Nowe
                            </div>
                        </div>
                    )
                })}

                {!existingGallery.length && !newFiles.length && (
                    <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400">
                        <ImageIcon className="mx-auto mb-2 opacity-50" size={48} />
                        <p className="text-sm">
                            Brak plików w galerii. Kliknij "Dodaj pliki" aby przesłać zdjęcia lub wideo.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GalleryUploader;
