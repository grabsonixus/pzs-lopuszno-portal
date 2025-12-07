import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pb } from '../services/pocketbase';
import { Post } from '../lib/types';
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import pl from "suneditor/src/lang/pl";
import ConfirmationModal from "./ConfirmationModal";

const AdminNewsForm: React.FC = () => {
  const [post, setPost] = useState<Partial<Post>>({
    title: '',
    slug: '',
    content: '',
    published: false,
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const controller = new AbortController();
    if (id) {
      setLoading(true);
      setError('');
      pb.collection('posts').getOne<Post>(id, { signal: controller.signal })
        .then(record => {
          if (!controller.signal.aborted) {
            setPost(record);
          }
        })
        .catch(err => {
          if (!err.isAbort) {
            console.error("Error fetching post:", err);
            setError('Nie udało się wczytać artykułu.');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setPost(prev => {
      const newPost = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      if (name === 'title') {
        newPost.slug = generateSlug(value);
      }

      return newPost;
    });
  };

  const handleContentChange = (content: string) => {
    setPost((prev) => ({ ...prev, content }));
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCoverImageFile(e.target.files[0]);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setGalleryFiles(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', post.title || '');
    formData.append('slug', post.slug || '');
    formData.append('content', post.content || '');
    formData.append('published', String(post.published || false));
    
    if (coverImageFile) {
      formData.append('cover_image', coverImageFile);
    }

    if (galleryFiles) {
      for (let i = 0; i < galleryFiles.length; i++) {
        formData.append('gallery', galleryFiles[i]);
      }
    }

    try {
      if (id) {
        await pb.collection('posts').update(id, formData);
      } else {
        await pb.collection('posts').create(formData);
      }
      navigate('/admin/news');
    } catch (err) {
      console.error("Error saving post:", err);
      setError('Nie udało się zapisać artykułu.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCancelModalOpen(true);
  };

  const confirmCancel = () => {
    navigate('/admin/news');
    setCancelModalOpen(false);
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
  };

  if (loading && id) return <p>Wczytywanie artykułu...</p>;

  return (
    <div className="container mx-auto p-4 max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8 items-start">
      <main>
        <h1 className="text-2xl font-bold mb-6">{id ? 'Edytuj artykuł' : 'Dodaj nowy artykuł'}</h1>
        <form id="news-form" onSubmit={handleSubmit} className="space-y-6 bg-white p-8 shadow-md rounded-lg">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tytuł</label>
            <input
              type="text"
              id="title"
              name="title"
              value={post.title}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug</label>
              <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={post.slug}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100"
                  required
                  readOnly
              />
          </div>

          <div>
            <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700">Zdjęcie okładki</label>
            <input
              type="file"
              id="cover_image"
              name="cover_image"
              onChange={handleCoverImageChange}
              className="mt-1 block w-full"
            />
          </div>

          <div>
            <label htmlFor="gallery" className="block text-sm font-medium text-gray-700">Galeria</label>
            <input
              type="file"
              id="gallery"
              name="gallery"
              onChange={handleGalleryChange}
              className="mt-1 block w-full"
              multiple
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">Treść</label>
            <SunEditor
              key={id || 'new'}
              lang={pl}
              defaultValue={post.content || ''}
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

          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={post.published}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-900">Opublikowany</label>
          </div>

          {error && <p className="text-red-500">{error}</p>}
        </form>
      </main>

      <aside className="sticky top-24">
        <div className="bg-white p-6 shadow-md rounded-lg flex flex-col gap-4">
            <button
                type="submit"
                form="news-form"
                disabled={loading}
                className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
                {loading ? 'Zapisywanie...' : 'Zapisz'}
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

export default AdminNewsForm;