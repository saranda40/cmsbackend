export interface tbl_landing_page {
    id?: number;
    slug: string;
    title: string;
    subtitle?: string;
    description?: string;
    main_image?: string; // Ruta relativa de la imagen subida
    cta_link?: string;
    cta_text?: string;
    content_html?: string; // Contenido HTML personalizado
    created_at?: string;
}