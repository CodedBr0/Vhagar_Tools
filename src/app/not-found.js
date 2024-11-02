import Image from 'next/image';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <Image
        src="/404.png"
        alt="404 Error"
        width={315}
        height={220}
        className={styles.errorImage}
      />
      <h1 className={styles.title}>404</h1>
      <p className={styles.message}>This page could not be found.</p>
    </div>
  );
}