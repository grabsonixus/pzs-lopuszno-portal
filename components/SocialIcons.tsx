import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { pb } from "../services/pocketbase";
import { SocialLink } from "../lib/types";

export const SocialIcons: React.FC<{ className?: string }> = ({ className }) => {
  const [links, setLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const records = await pb.collection("social_links").getFullList<SocialLink>({
          sort: "order",
          filter: "is_active = true",
        });
        setLinks(records);
      } catch (error) {
        console.error("Failed to fetch social links:", error);
      }
    };

    fetchLinks();
  }, []);

  if (links.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {links.map((link) => {
        // Dynamic icon rendering
        const IconComponent = (Icons as any)[link.icon] || Icons.Link;
        
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-600 hover:text-school-primary hover:bg-gray-100 rounded-full transition-colors"
            title={link.custom_label || link.platform}
          >
            <IconComponent size={20} />
          </a>
        );
      })}
    </div>
  );
};
