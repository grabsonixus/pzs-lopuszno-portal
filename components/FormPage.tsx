import React from "react";
import { useParams, Link } from "react-router-dom";
import DynamicForm from "./DynamicForm";
import { ArrowLeft } from "lucide-react";

const FormPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="container mx-auto p-6 max-w-3xl min-h-[70vh] py-12">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={20} /> Wróć do strony głównej
        </Link>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="p-2">
          <DynamicForm formSlug={slug} />
        </div>
      </div>
    </div>
  );
};

export default FormPage;
