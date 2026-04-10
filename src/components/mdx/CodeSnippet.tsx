import styles from './Editorial.module.css';

interface CodeSnippetProps {
  code: string;
  lang?: string;
  title?: string;
  annotation?: string;
}

export function CodeSnippet({ code, lang = '', title, annotation }: CodeSnippetProps) {
  return (
    <figure className={styles.codeSnippet}>
      <div className={styles.codeSnippetHeader}>
        <div className={styles.codeSnippetDots}>
          <span /><span /><span />
        </div>
        {title && <span className={styles.codeSnippetTitle}>{title}</span>}
        {lang && <span className={styles.codeSnippetLang}>{lang}</span>}
      </div>
      <pre className={styles.codeSnippetPre}>
        <code>{code?.trim() ?? ''}</code>
      </pre>
      {annotation && (
        <figcaption className={styles.codeSnippetAnnotation}>
          // {annotation}
        </figcaption>
      )}
    </figure>
  );
}
