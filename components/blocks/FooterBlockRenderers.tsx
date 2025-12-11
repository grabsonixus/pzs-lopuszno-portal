import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Lock,
  ChevronRight,
} from "lucide-react";
import { FooterBlock, FooterLink } from "../../lib/types";
import { Link } from "react-router-dom";
import DynamicIcon from "../DynamicIcon";

export const ContactBlockRenderer: React.FC<{ data: FooterBlock["data"] }> = ({
  data,
}) => (
  <ul className="space-y-3">
    {data.address && (
      <li className="flex items-start gap-3">
        <MapPin size={18} className="text-school-accent mt-0.5 shrink-0" />
        <span className="whitespace-pre-line">{data.address}</span>
      </li>
    )}
    {data.phone && (
      <li className="flex items-center gap-3">
        <Phone size={18} className="text-school-accent shrink-0" />
        <a
          href={`tel:${data.phone.replace(/\s/g, "")}`}
          className="hover:text-white transition-colors"
        >
          {data.phone}
        </a>
      </li>
    )}
    {data.email && (
      <li className="flex items-center gap-3">
        <Mail size={18} className="text-school-accent shrink-0" />
        <a
          href={`mailto:${data.email}`}
          className="hover:text-white transition-colors break-all"
        >
          {data.email}
        </a>
      </li>
    )}
  </ul>
);

export const TextBlockRenderer: React.FC<{ data: FooterBlock["data"] }> = ({
  data,
}) => (
  <div className="text-blue-200 prose prose-invert prose-sm max-w-none">
    <p className="whitespace-pre-line">{data.content}</p>
  </div>
);

export const LinksBlockRenderer: React.FC<{ data: FooterBlock["data"] }> = ({
  data,
}) => (
  <ul className="space-y-2">
    {data.links?.map((link, idx) => (
      <li key={idx}>
        {link.url.startsWith("http") ? (
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white transition-colors group"
          >
            {link.icon ? (
              <DynamicIcon
                name={link.icon}
                size={16}
                className="group-hover:text-school-accent"
              />
            ) : (
              <ChevronRight size={14} className="text-school-accent" />
            )}
            {link.label}
          </a>
        ) : (
          <Link
            to={link.url}
            className="flex items-center gap-2 hover:text-white transition-colors group"
          >
            {link.icon ? (
              <DynamicIcon
                name={link.icon}
                size={16}
                className="group-hover:text-school-accent"
              />
            ) : (
              <ChevronRight size={14} className="text-school-accent" />
            )}
            {link.label}
          </Link>
        )}
      </li>
    ))}
  </ul>
);

export const AdminBlockRenderer: React.FC = () => (
  <div>
    <p className="mb-4 text-blue-200 text-xs">
      Panel zarządzania treścią dla administratorów i redaktorów strony.
    </p>
    <a
      href={`admin`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded text-sm transition-colors border border-blue-700"
    >
      <Lock size={14} />
      Panel Administratora
      <ExternalLink size={12} />
    </a>
  </div>
);
