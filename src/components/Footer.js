import Image from "next/image";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.containerr}>
        <div className={`${styles.column} ${styles.first}`}>
          <a href="/" className={styles.logoIconLink}>
            <Image src="/logo_icon2.png" width={220} height={210} alt="Logo Icon" className={styles.logoIcon} />
          </a>
        </div>
        <div className={styles.column}>
          <a href="/" className={styles.logoWordLink}>
            <Image src="/logo_with_word.png" width={160} height={80} alt="Logo with Word" className={styles.logoWord} />
          </a>
          <ul className="list-unstyled">
            <li className={styles.coll}>Vhagar on Solana</li>
            <li className={styles.coll}>Not just a token</li>
          </ul>
        </div>
        <div className={styles.column}>
          <h4 className="fw-bold">
            <a href="https://raydium.io/" target="_blank" rel="noopener noreferrer">
              Raydium
            </a>
          </h4>
          <ul className="list-unstyled">
            <li className={styles.coll}>
              <a href="https://vhagar.finance/#about" target="_blank" rel="noopener noreferrer">About</a>
            </li>
            <li className={styles.coll}>
              <a href="https://vhagar.finance/#tokenomics" target="_blank" rel="noopener noreferrer">Tokenomics</a>
            </li>
            <li className={styles.coll}>
              <a href="https://vhagar.finance/#roadmap-container" target="_blank" rel="noopener noreferrer">RoadMap</a>
            </li>
          </ul>
        </div>
        <div className={`${styles.column} ${styles.coServe}`}>
          <h4 className="fw-bold">
            <a href="https://dexscreener.com/" target="_blank" rel="noopener noreferrer">
              Dex Screener
            </a>
          </h4>
          <ul className="list-unstyled">
            <li className={styles.coll}>
              <a href="https://jup.ag/" target="_blank" rel="noopener noreferrer">Jupiter Dex</a>
            </li>
            <li className={styles.coll}>
              <a href="https://coinmarketcap.com/" target="_blank" rel="noopener noreferrer">Coinmarketcap</a>
            </li>
            <li className={styles.coll}>
              <a href="https://birdeye.so/token/4UvV46RjhL4Xvy1DeGWBHJ2EWUwzgNN2EzUumMqMVDQA?chain=solana" target="_blank" rel="noopener noreferrer">BirdEye</a>
            </li>
          </ul>
        </div>
        <div className={styles.coCont}>
          <div className="d-flex justify-content-center align-items-center pt-4">
            <a href="https://discord.com/invite/3fKQTuYSYP" target="_blank" rel="noopener noreferrer" className="pe-2">
              <Image src="/discord.png" width={50} height={50} alt="Discord" className={styles.socialIcon} />
            </a>
            <a href="https://t.me/Vhagar_on_Sol" target="_blank" rel="noopener noreferrer" className="pe-2">
              <Image src="/telegram.png" width={50} height={50} alt="Telegram" className={styles.socialIcon} />
            </a>
            <a href="https://x.com/Vhagar_on_Sol" target="_blank" rel="noopener noreferrer" className="bg-light">
              <Image src="/x1.png" width={50} height={50} alt="X" className={styles.socialIcon} />
            </a>
          </div>
        </div>
      </div>
      <div className={styles.footerDivider}></div>
      <p className={`text-center ${styles.opp} p-2`}>
        <i className="bi bi-c-circle" style={{ color: "#5ee616" }}></i>
        &nbsp;2024 Vhagar. &nbsp;All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;