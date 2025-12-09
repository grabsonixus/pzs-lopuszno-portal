declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.webp";
declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.ico";
declare module "*.avif";
