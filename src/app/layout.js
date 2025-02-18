import "./globals.css";

export const metadata = {
  title: "Cosmic AI Text Processor",
  description: "A tool for translating, summarizing, and detecting language of text messages.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          httpEquiv="origin-trial"
          content={process.env.NEXT_PUBLIC_TRANSLATOR_API_TOKEN}
        />
        <meta
          httpEquiv="origin-trial"
          content={process.env.NEXT_PUBLIC_LANGUAGE_DETECTOR_API_TOKEN}
        />
        <meta
          httpEquiv="origin-trial"
          content={process.env.NEXT_PUBLIC_SUMMARIZER_API_TOKEN}
        />
      </head>
      <body
      >
        {children}
      </body>
    </html>
  );
}
