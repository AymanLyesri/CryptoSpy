import Script from "next/script";

interface JsonLdProps {
  data: any;
  id?: string;
}

export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <Script
      id={id || "structured-data"}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={structuredData} id="breadcrumb-json-ld" />;
}

export function ArticleJsonLd({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  authorName,
  publisherName,
  url,
}: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  publisherName: string;
  url: string;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: headline,
    description: description,
    image: image,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: publisherName,
    },
    url: url,
  };

  return <JsonLd data={structuredData} id="article-json-ld" />;
}
