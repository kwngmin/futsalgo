import Script from "next/script";

/**
 * 웹사이트 구조화된 데이터 컴포넌트
 * @returns JSON-LD 스크립트
 */
export function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Futsalgo",
    alternateName: "풋살고",
    url: "https://futsalgo.com",
    description:
      "풋살 일정 등록, 매칭, 득점·도움 기록, 참석자 관리, MVP 투표, 사진 공유까지. 풋살 하러 Go! Futsalgo!",
    inLanguage: "ko-KR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://futsalgo.com/?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "Futsalgo",
      url: "https://futsalgo.com",
      logo: {
        "@type": "ImageObject",
        url: "https://futsalgo.com/futsalgo_logo_v4.svg",
      },
    },
  };

  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

/**
 * 조직 구조화된 데이터 컴포넌트
 * @returns JSON-LD 스크립트
 */
export function OrganizationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Futsalgo",
    url: "https://futsalgo.com",
    logo: "https://futsalgo.com/futsalgo_logo_v4.svg",
    description:
      "풋살 일정 등록, 매칭, 득점·도움 기록, 참석자 관리, MVP 투표, 사진 공유까지. 풋살 하러 Go! Futsalgo!",
    sameAs: ["https://twitter.com/futsalgo", "https://instagram.com/futsalgo"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@futsalgo.com",
    },
  };

  return (
    <Script
      id="organization-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

/**
 * 소프트웨어 애플리케이션 구조화된 데이터 컴포넌트
 * @returns JSON-LD 스크립트
 */
export function SoftwareApplicationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Futsalgo",
    applicationCategory: "SportsApplication",
    operatingSystem: "Web Browser",
    description:
      "풋살 일정 등록, 매칭, 득점·도움 기록, 참석자 관리, MVP 투표, 사진 공유까지. 풋살 하러 Go! Futsalgo!",
    url: "https://futsalgo.com",
    screenshot: "https://futsalgo.com/og-image.png",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1000",
    },
    author: {
      "@type": "Organization",
      name: "Futsalgo",
    },
  };

  return (
    <Script
      id="software-application-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
